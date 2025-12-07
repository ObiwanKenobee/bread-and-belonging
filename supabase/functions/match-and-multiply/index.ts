import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.86.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Fetch open community needs
    const { data: needs, error: needsError } = await supabase
      .from("community_needs")
      .select("*")
      .eq("status", "open")
      .order("priority", { ascending: false });

    if (needsError) {
      console.error("Error fetching needs:", needsError);
      throw new Error("Failed to fetch community needs");
    }

    // Fetch available inventory with product details
    const { data: inventory, error: inventoryError } = await supabase
      .from("inventory")
      .select(`
        *,
        products (
          id,
          name,
          description,
          category,
          unit,
          price_per_unit,
          sustainability_score,
          producer_id
        )
      `)
      .gt("available_quantity", 0);

    if (inventoryError) {
      console.error("Error fetching inventory:", inventoryError);
      throw new Error("Failed to fetch inventory");
    }

    if (!needs?.length || !inventory?.length) {
      return new Response(
        JSON.stringify({
          matches: [],
          message: needs?.length === 0 
            ? "No open community needs found" 
            : "No available inventory found"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Prepare data for AI analysis
    const needsSummary = needs.map(n => ({
      id: n.id,
      title: n.title,
      category: n.category,
      quantity: n.quantity_needed,
      unit: n.unit,
      location: n.location,
      priority: n.priority,
      description: n.description
    }));

    const inventorySummary = inventory.map(i => ({
      inventory_id: i.id,
      product_id: i.products?.id,
      product_name: i.products?.name,
      category: i.products?.category,
      available_quantity: i.available_quantity,
      unit: i.products?.unit,
      location: i.location,
      expiry_date: i.expiry_date,
      sustainability_score: i.products?.sustainability_score
    }));

    const systemPrompt = `You are the Match & Multiply AI for the Loaves & Fish Network - a community-owned humanitarian platform. Your role is to suggest optimal matches between available products/inventory and community needs.

MATCHING CRITERIA (in order of importance):
1. Category match - products should match the need category
2. Priority - high priority needs should be matched first
3. Location proximity - prefer matches in the same or nearby locations
4. Quantity fulfillment - match inventory that can fulfill the need quantity
5. Sustainability - prefer products with higher sustainability scores
6. Expiry urgency - prioritize items expiring soon to reduce waste

RESPONSE FORMAT:
Return a JSON array of match suggestions. Each match should include:
- need_id: UUID of the community need
- inventory_id: UUID of the inventory item
- product_name: Name of the product
- match_score: 0-100 score indicating match quality
- reasoning: Brief explanation of why this is a good match (2-3 sentences)
- impact_estimate: Estimated number of people this could help

Be practical and helpful. If categories don't match exactly but could still fulfill a need, suggest it with appropriate reasoning.`;

    const userPrompt = `Analyze and suggest optimal matches between these community needs and available inventory:

COMMUNITY NEEDS:
${JSON.stringify(needsSummary, null, 2)}

AVAILABLE INVENTORY:
${JSON.stringify(inventorySummary, null, 2)}

Suggest up to 10 optimal matches, prioritizing high-priority needs and best category matches.`;

    console.log("Calling AI for match suggestions...");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw new Error("AI gateway error");
    }

    const aiResponse = await response.json();
    const content = aiResponse.choices?.[0]?.message?.content;

    console.log("AI response received:", content?.substring(0, 200));

    // Parse AI response - extract JSON from response
    let matches = [];
    try {
      // Try to extract JSON array from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        matches = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.error("Error parsing AI response:", parseError);
      matches = [];
    }

    // Enrich matches with full data
    const enrichedMatches = matches.map((match: any) => {
      const need = needs.find(n => n.id === match.need_id);
      const inv = inventory.find(i => i.id === match.inventory_id);
      
      return {
        ...match,
        product_id: inv?.products?.id,
        need_title: need?.title,
        need_priority: need?.priority,
        need_location: need?.location,
        need_quantity: need?.quantity_needed,
        need_unit: need?.unit,
        inventory_location: inv?.location,
        available_quantity: inv?.available_quantity,
        expiry_date: inv?.expiry_date,
        sustainability_score: inv?.products?.sustainability_score
      };
    });

    return new Response(
      JSON.stringify({ 
        matches: enrichedMatches,
        total_needs: needs.length,
        total_inventory: inventory.length
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Match & Multiply error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
