// =============================================================================
// scrapeWebsite — Extracts business info from a URL using a CORS proxy
// Uses allorigins.win as the proxy (free, no key required)
// Parses the HTML to extract: business name, description, pricing, benefits
// =============================================================================

export interface ScrapedInfo {
  businessName: string;
  industry: string;
  productService: string;
  targetCustomer: string;
  mainBenefit: string;
  price: string;
  websiteUrl: string;
}

// Keyword maps for industry detection
const INDUSTRY_KEYWORDS: Record<string, string[]> = {
  "CRM / Software": ["crm", "software", "saas", "platform", "app", "tool", "dashboard", "automation"],
  "Real Estate": ["real estate", "property", "homes", "mortgage", "realty", "realtor"],
  "Marketing Agency": ["agency", "marketing", "ads", "leads", "campaigns", "traffic", "funnel"],
  "Coaching / Consulting": ["coaching", "consultant", "mentor", "program", "course", "training"],
  "Health & Wellness": ["health", "wellness", "fitness", "weight loss", "nutrition", "therapy"],
  "Financial Services": ["financial", "insurance", "investment", "wealth", "accounting", "tax"],
  "E-commerce": ["store", "shop", "products", "ecommerce", "shipping", "order"],
  "Home Services": ["plumbing", "hvac", "roofing", "cleaning", "landscaping", "electrical", "home service"],
};

function detectIndustry(text: string): string {
  const lower = text.toLowerCase();
  for (const [industry, keywords] of Object.entries(INDUSTRY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return industry;
  }
  return "";
}

// Extract price mentions from text
function extractPrice(text: string): string {
  // Match patterns like $497/mo, $5,000, $997/month, etc.
  const priceRegex = /\$[\d,]+(?:\.\d{2})?(?:\s*\/\s*(?:mo|month|yr|year|week|day|one.?time|setup))?/gi;
  const matches = text.match(priceRegex);
  if (matches && matches.length > 0) {
    // Return up to 2 price mentions joined
    return matches.slice(0, 2).join(" or ");
  }
  return "";
}

// Strip HTML tags and normalize whitespace
function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

// Extract meta content
function extractMeta(html: string, name: string): string {
  const regex = new RegExp(
    `<meta[^>]+(?:name|property)=["'](?:og:)?${name}["'][^>]+content=["']([^"']+)["']`,
    "i"
  );
  const altRegex = new RegExp(
    `<meta[^>]+content=["']([^"']+)["'][^>]+(?:name|property)=["'](?:og:)?${name}["']`,
    "i"
  );
  const match = html.match(regex) || html.match(altRegex);
  return match ? match[1].trim() : "";
}

// Extract title
function extractTitle(html: string): string {
  const ogTitle = extractMeta(html, "title");
  if (ogTitle) return ogTitle;
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return titleMatch ? titleMatch[1].replace(/\s*[-|].*$/, "").trim() : "";
}

// Extract h1/h2 headings
function extractHeadings(html: string): string[] {
  const headings: string[] = [];
  const h1Regex = /<h1[^>]*>([\s\S]*?)<\/h1>/gi;
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;
  let match;
  while ((match = h1Regex.exec(html)) !== null) {
    const text = stripHtml(match[1]).trim();
    if (text.length > 5 && text.length < 200) headings.push(text);
  }
  while ((match = h2Regex.exec(html)) !== null) {
    const text = stripHtml(match[1]).trim();
    if (text.length > 5 && text.length < 200) headings.push(text);
  }
  return headings.slice(0, 6);
}

// Extract paragraphs near benefit keywords
function extractBenefitText(text: string): string {
  const benefitKeywords = ["help you", "so you can", "transform", "result", "benefit", "achieve", "get more", "save", "increase", "grow", "close more", "generate"];
  const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 20 && s.trim().length < 200);
  for (const sentence of sentences) {
    const lower = sentence.toLowerCase();
    if (benefitKeywords.some((kw) => lower.includes(kw))) {
      return sentence.trim();
    }
  }
  return sentences[0] || "";
}

export async function scrapeWebsite(url: string): Promise<ScrapedInfo> {
  // Normalize URL
  let normalizedUrl = url.trim();
  if (!normalizedUrl.startsWith("http")) {
    normalizedUrl = "https://" + normalizedUrl;
  }

  // Use allorigins as CORS proxy
  const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(normalizedUrl)}`;

  const response = await fetch(proxyUrl, { signal: AbortSignal.timeout(12000) });
  if (!response.ok) {
    throw new Error(`Failed to fetch: ${response.status}`);
  }

  const data = await response.json();
  const html: string = data.contents || "";

  if (!html || html.length < 100) {
    throw new Error("Could not read page content. Try entering manually.");
  }

  // Extract all text
  const fullText = stripHtml(html);

  // Extract structured info
  const title = extractTitle(html);
  const description = extractMeta(html, "description") || extractMeta(html, "og:description");
  const headings = extractHeadings(html);
  const price = extractPrice(fullText);
  const industry = detectIndustry(fullText);

  // Build product/service description from title + description + first heading
  const productParts = [
    description || "",
    headings[0] || "",
    headings[1] || "",
  ].filter(Boolean);
  const productService = productParts.slice(0, 2).join(" — ").slice(0, 400);

  // Try to find target customer language
  const targetKeywords = ["for ", "helping ", "designed for ", "built for ", "ideal for "];
  let targetCustomer = "";
  for (const kw of targetKeywords) {
    const idx = fullText.toLowerCase().indexOf(kw);
    if (idx !== -1) {
      const snippet = fullText.slice(idx, idx + 120).split(/[.!?,]/)[0];
      if (snippet.length > 15) {
        targetCustomer = snippet.trim();
        break;
      }
    }
  }

  // Extract main benefit
  const mainBenefit = extractBenefitText(fullText) || headings[2] || "";

  return {
    businessName: title || new URL(normalizedUrl).hostname.replace("www.", ""),
    industry,
    productService: productService || fullText.slice(0, 300),
    targetCustomer: targetCustomer.slice(0, 200),
    mainBenefit: mainBenefit.slice(0, 200),
    price,
    websiteUrl: normalizedUrl,
  };
}
