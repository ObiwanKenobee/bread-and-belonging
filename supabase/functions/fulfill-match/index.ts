import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get authorization header for user context
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Authorization required" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get user from auth token
    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ error: "Invalid authorization" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { needId, productId, inventoryId, quantityFulfilled, notes } = await req.json();

    console.log("Fulfillment request:", { needId, productId, inventoryId, quantityFulfilled, userId: user.id });

    // Validate required fields
    if (!needId || !productId || !inventoryId || !quantityFulfilled) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: needId, productId, inventoryId, quantityFulfilled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Verify the product belongs to the producer
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id, name, producer_id, category")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      console.error("Product error:", productError);
      return new Response(
        JSON.stringify({ error: "Product not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (product.producer_id !== user.id) {
      return new Response(
        JSON.stringify({ error: "You can only fulfill matches with your own products" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Check inventory availability
    const { data: inventory, error: inventoryError } = await supabase
      .from("inventory")
      .select("id, available_quantity, quantity, reserved_quantity")
      .eq("id", inventoryId)
      .single();

    if (inventoryError || !inventory) {
      console.error("Inventory error:", inventoryError);
      return new Response(
        JSON.stringify({ error: "Inventory not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (inventory.available_quantity < quantityFulfilled) {
      return new Response(
        JSON.stringify({ error: `Insufficient inventory. Available: ${inventory.available_quantity}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 3. Verify the community need exists and is open/matched
    const { data: need, error: needError } = await supabase
      .from("community_needs")
      .select("id, title, status, quantity_needed")
      .eq("id", needId)
      .single();

    if (needError || !need) {
      console.error("Need error:", needError);
      return new Response(
        JSON.stringify({ error: "Community need not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (need.status === "fulfilled") {
      return new Response(
        JSON.stringify({ error: "This need has already been fulfilled" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 4. Create fulfillment record
    const { data: fulfillment, error: fulfillmentError } = await supabase
      .from("match_fulfillments")
      .insert({
        community_need_id: needId,
        product_id: productId,
        producer_id: user.id,
        quantity_fulfilled: quantityFulfilled,
        notes: notes || null,
      })
      .select()
      .single();

    if (fulfillmentError) {
      console.error("Fulfillment insert error:", fulfillmentError);
      return new Response(
        JSON.stringify({ error: "Failed to create fulfillment record" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Fulfillment record created:", fulfillment.id);

    // 5. Update inventory (reduce available quantity)
    const newAvailableQuantity = inventory.available_quantity - quantityFulfilled;
    const newQuantity = inventory.quantity - quantityFulfilled;

    const { error: inventoryUpdateError } = await supabase
      .from("inventory")
      .update({
        available_quantity: newAvailableQuantity,
        quantity: newQuantity,
        last_updated: new Date().toISOString(),
      })
      .eq("id", inventoryId);

    if (inventoryUpdateError) {
      console.error("Inventory update error:", inventoryUpdateError);
      // Note: In production, you'd want to rollback the fulfillment record here
    }

    console.log("Inventory updated. New available:", newAvailableQuantity);

    // 6. Update community need status to fulfilled
    const { error: needUpdateError } = await supabase
      .from("community_needs")
      .update({
        status: "fulfilled",
        matched_product_id: productId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", needId);

    if (needUpdateError) {
      console.error("Need update error:", needUpdateError);
    }

    console.log("Community need marked as fulfilled");

    // 7. Award dignity credits to the producer
    const creditsEarned = Math.round(quantityFulfilled * 10); // 10 credits per unit fulfilled
    
    const { error: creditsError } = await supabase
      .from("dignity_credits")
      .insert({
        user_id: user.id,
        amount: creditsEarned,
        transaction_type: "earned",
        source: "match_fulfillment",
        description: `Fulfilled ${quantityFulfilled} units for: ${need.title}`,
        related_product_id: productId,
      });

    if (creditsError) {
      console.error("Credits insert error:", creditsError);
    }

    console.log("Dignity credits awarded:", creditsEarned);

    return new Response(
      JSON.stringify({
        success: true,
        fulfillment: {
          id: fulfillment.id,
          quantityFulfilled,
          creditsEarned,
          needTitle: need.title,
          productName: product.name,
        },
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: unknown) {
    console.error("Fulfill match error:", error);
    const errorMessage = error instanceof Error ? error.message : "Internal server error";
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
