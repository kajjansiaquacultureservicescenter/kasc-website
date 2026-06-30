import { NextRequest, NextResponse } from "next/server";

// ── Rule-based responses ────────────────────────────────────────────────────
type Rule = { keywords: string[]; response: string };

const RULES: Rule[] = [
  {
    keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening", "howdy", "greetings"],
    response: "Hello! 👋 Welcome to Kajjansi Aquaculture Service Centre (KASC). I'm here to help you with information about our fish farming services, products, and pricing. What can I help you with today?",
  },
  {
    keywords: ["fingerling", "tilapia", "catfish", "miracle", "fry", "juvenile", "seed"],
    response: "We produce high-quality fish fingerlings from our own certified hatchery:\n\n🐟 **Nile Tilapia** — UGX 500/fingerling\n🐟 **African Catfish (Clarias)** — UGX 600/fingerling\n🐟 **Miracle Tilapia** — UGX 700/fingerling\n\nMinimum order: 300–500 fingerlings. We produce over 1 million fingerlings per year and supply across Uganda, Kenya, Tanzania and Rwanda.\n\nWould you like to place an order or get more details? Call us: **+256 700 000000**",
  },
  {
    keywords: ["feed", "pellet", "food", "starter", "grower", "protein"],
    response: "We supply quality fish feeds:\n\n🥣 **Starter Feed (1mm) — 45% protein** — UGX 85,000 per 25kg bag\n🥣 **Grower Feed (3mm) — 38% protein** — UGX 75,000 per 25kg bag\n\nOur feeds are formulated for fast growth and feed conversion. Bulk discounts available for orders above 10 bags.\n\nCall or WhatsApp us: **+256 700 000000**",
  },
  {
    keywords: ["dam liner", "liner", "geomembrane", "hdpe", "pond liner", "0.5", "0.75", "1.0mm"],
    response: "We are Uganda's leading dam liner specialists:\n\n🔷 **0.5mm HDPE liner** — UGX 12,000/m²\n🔷 **0.75mm HDPE liner** — UGX 16,000/m²\n🔷 **1.0mm HDPE liner** — UGX 22,000/m²\n\nAll liners are UV-treated, machine-welded, pneumatic leak-tested, and come with after-sales support. We handle supply and professional installation.\n\nFor a custom quote based on your pond dimensions, call us: **+256 700 000000**",
  },
  {
    keywords: ["pond", "construction", "build", "dig", "excavat", "design"],
    response: "Our fish pond construction service covers everything:\n✅ Site assessment & soil testing\n✅ Pond design & layout\n✅ Earthworks & excavation\n✅ Inlet/outlet structures\n✅ Aeration systems\n✅ Dam liner installation\n✅ Post-construction water testing\n\nWe handle earthen ponds, lined ponds, and concrete tanks. Pricing depends on pond size and specifications — contact us for a free site assessment.\n\n📞 **+256 700 000000** | 📧 info@kasc.ug",
  },
  {
    keywords: ["cage", "cage culture", "lake", "floating cage"],
    response: "We design and install fish cages for lake-based aquaculture:\n\n🔹 HDPE cage systems\n🔹 Galvanized cage systems\n🔹 Site feasibility studies\n🔹 Regulatory documentation support\n🔹 Mooring and anchoring systems\n\nCage sizes are custom-made based on your farm plan. Call us for a consultation:\n📞 **+256 700 000000**",
  },
  {
    keywords: ["training", "course", "learn", "class", "workshop", "certificate", "seminar"],
    response: "We offer hands-on aquaculture training at our Kajjansi demonstration farm:\n\n🎓 **Fish Farming Fundamentals** — for beginners\n🎓 **Advanced Farm Management** — production & profitability\n🎓 **Dam Liner Installation Certification**\n🎓 **Water Quality Monitoring**\n\nTraining is practical and includes farm visits. Certificates awarded on completion. Dates are scheduled monthly.\n\nRegister or inquire: 📞 **+256 700 000000**",
  },
  {
    keywords: ["consultancy", "consult", "advice", "feasibility", "study", "planning", "start", "begin", "how do i"],
    response: "Getting started in fish farming? Our consultancy service includes:\n\n🔍 Site assessment & water quality testing\n🔍 Species selection guidance\n🔍 Farm design & layout planning\n🔍 Financial feasibility studies\n🔍 Licensing & permit support\n\nWe work with both beginners and established farmers. Book a free initial consultation:\n📞 **+256 700 000000** | 📧 info@kasc.ug",
  },
  {
    keywords: ["price", "cost", "how much", "rate", "charge", "fee", "pricing", "quote"],
    response: "Here's a quick pricing summary:\n\n**Fingerlings:** UGX 500–700 each (by species)\n**Fish Feed:** UGX 75,000–85,000 per 25kg bag\n**Dam Liners:** UGX 12,000–22,000 per m² (by thickness)\n**Equipment:** Varies by item\n\nPond construction, cage installation, and consultancy are quoted based on project scope.\n\nFor a detailed quote, call us: 📞 **+256 700 000000** or visit our shop.",
  },
  {
    keywords: ["contact", "phone", "call", "whatsapp", "email", "reach", "address", "location", "where", "find you"],
    response: "Here's how to reach us:\n\n📍 **Location:** Kajjansi, Wakiso District, Uganda (Entebbe Road)\n📞 **Phone/WhatsApp:** +256 700 000000\n📧 **Email:** info@kasc.ug\n🕐 **Hours:** Monday–Saturday, 8:00am–6:00pm EAT\n\nYou're also welcome to visit our demonstration farm at Kajjansi — we love hosting farm visits!\n\nOr fill in our [contact form](/contact) and we'll get back to you.",
  },
  {
    keywords: ["delivery", "shipping", "ship", "deliver", "transport"],
    response: "Yes, we deliver across Uganda and to neighbouring countries! 🚚\n\nDelivery charges depend on your location and order size. Fingerlings and feeds can be delivered with proper packaging.\n\nFor delivery quotes, please call us:\n📞 **+256 700 000000**",
  },
  {
    keywords: ["order", "buy", "purchase", "shop", "get"],
    response: "You can order our products in two ways:\n\n🛒 **Online** — Visit our [shop](/shop), add items to your cart, and place your order with your preferred payment method (Cash on Delivery, MTN MoMo, Airtel Money, or Bank Transfer)\n\n📞 **By phone** — Call us on **+256 700 000000** and we'll process your order directly.\n\nWhat would you like to order?",
  },
  {
    keywords: ["payment", "pay", "momo", "mobile money", "airtel", "bank", "cash"],
    response: "We accept multiple payment methods:\n\n💵 Cash on Delivery\n📱 MTN Mobile Money\n📱 Airtel Money\n🏦 Bank Transfer\n\nFor Mobile Money and Bank Transfer payments, you'll provide your transaction reference during checkout. Need help? Call us: 📞 **+256 700 000000**",
  },
  {
    keywords: ["farm", "demonstration", "visit", "tour", "kajansi farm"],
    response: "Our demonstration farm at Kajjansi is open for visits! 🌿\n\n**At the farm you'll find:**\n🐟 Live breeding hatchery\n🏊 Demonstration ponds\n🎓 Training centre\n🔬 Water quality lab\n🏭 Liner fabrication shop\n\nFarm visits are great for learning and seeing operations firsthand. We'd love to host you!\n\nBook a visit: 📞 **+256 700 000000**",
  },
  {
    keywords: ["water", "quality", "test", "ph", "oxygen", "ammonia", "parameter"],
    response: "Water quality is critical for fish health and farm profitability. We offer:\n\n🔬 **Water quality testing** at our on-site lab\n🛒 **Test kits for sale** — multi-parameter kits for pH, DO, ammonia, nitrite\n📚 **Water quality training** — learn to monitor and manage your water\n\nFor water testing or equipment, call us:\n📞 **+256 700 000000**",
  },
  {
    keywords: ["thank", "thanks", "appreciate", "helpful", "great", "good"],
    response: "You're very welcome! 😊 We're happy to help. If you have any more questions or need to speak with one of our specialists, don't hesitate to call us on **+256 700 000000** or visit us at Kajjansi. We wish you great success in your fish farming journey! 🐟🌿",
  },
  {
    keywords: ["bye", "goodbye", "see you", "later", "ciao"],
    response: "Goodbye! 👋 Feel free to come back anytime you have questions. You can also reach us at **+256 700 000000**. Best of luck with your aquaculture ventures!",
  },
];

const DEFAULT_RESPONSE =
  "Thank you for your message! For detailed information or assistance, our team is available:\n\n📞 **+256 700 000000** (Phone/WhatsApp)\n📧 **info@kasc.ug**\n🕐 Monday–Saturday, 8:00am–6:00pm\n\nYou can also browse our [shop](/shop) or fill in our [contact form](/contact) and we'll respond promptly. Is there something specific about our fish farming services I can help with?";

function getRuleBasedResponse(userMessage: string): string {
  const lower = userMessage.toLowerCase();
  for (const rule of RULES) {
    if (rule.keywords.some((kw) => lower.includes(kw))) {
      return rule.response;
    }
  }
  return DEFAULT_RESPONSE;
}

// ── Route handler ───────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();
    const lastUserMessage: string = messages?.findLast((m: any) => m.role === "user")?.content ?? "";
    const message = getRuleBasedResponse(lastUserMessage);
    return NextResponse.json({ message });
  } catch {
    return NextResponse.json(
      { message: "I'm having trouble right now. Please call us on **+256 700 000000** or WhatsApp us — available Mon–Sat, 8am–6pm." },
      { status: 500 }
    );
  }
}
