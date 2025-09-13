'use server';

// Community business data for detailed page
const allCommunityBusinesses = [
  {
    id: 1,
    name: "Sample Textile Company",
    logo: "/logo-placeholder.png",
    category: "Textile & Fashion",
    phone: "+92-XXX-XXX-XXXX",
    email: "contact@business.com",
    website: "www.business.com",
    address: "Business Address, City",
    established: "2020",
    owner: "Business Owner Name",
    specialOffers: "Special offers for community members",
    services: ["Service 1", "Service 2", "Service 3", "Service 4"],
    description: "Sample description of textile business providing quality products and services to the community.",
    detailedDescription: "Detailed description of the business, its history, services, and commitment to quality. This is placeholder text that would be replaced with actual business information when real data is available."
  },
  {
    id: 2,
    name: "Electronics Store Sample",
    logo: "/logo-placeholder.png",
    category: "Electronics",
    phone: "+92-XXX-XXX-XXXX",
    email: "info@electronics.com",
    website: "www.electronics.com",
    address: "Store Address, City",
    established: "2018",
    owner: "Store Owner Name",
    specialOffers: "Member discounts available",
    services: ["Electronics Sales", "Repair Services", "Installation", "Support"],
    description: "Sample electronics store offering latest gadgets and professional repair services.",
    detailedDescription: "Comprehensive description of electronics business services, product range, and customer support. This placeholder text represents where actual business details would appear."
  },
  {
    id: 3,
    name: "Family Restaurant Sample",
    logo: "/logo-placeholder.png",
    category: "Food & Dining",
    phone: "+92-XXX-XXX-XXXX",
    email: "orders@restaurant.com",
    website: "www.restaurant.com",
    address: "Restaurant Location, City",
    established: "2015",
    owner: "Restaurant Owner",
    specialOffers: "Community event catering discounts",
    services: ["Dining", "Catering", "Delivery", "Events"],
    description: "Sample restaurant serving authentic cuisine in a family-friendly environment.",
    detailedDescription: "Full description of restaurant offerings, cuisine types, catering services, and dining experience. This is sample text for demonstration purposes."
  },
  {
    id: 4,
    name: "Auto Service Center",
    logo: "/logo-placeholder.png",
    category: "Automotive",
    phone: "+92-XXX-XXX-XXXX",
    email: "service@automotive.com",
    website: "www.automotive.com",
    address: "Service Center Address, City",
    established: "2010",
    owner: "Service Owner Name",
    specialOffers: "Special financing for members",
    services: ["Car Sales", "Maintenance", "Repairs", "Parts"],
    description: "Sample automotive business providing vehicle sales and professional maintenance services.",
    detailedDescription: "Detailed information about automotive services, expertise, facilities, and customer care. This placeholder content shows the structure for real business data."
  },
  {
    id: 5,
    name: "Community Grocery Store",
    logo: "/logo-placeholder.png",
    category: "Grocery & Food",
    phone: "+92-XXX-XXX-XXXX",
    email: "orders@grocery.com",
    website: "www.grocery.com",
    address: "Store Location, City",
    established: "2012",
    owner: "Store Manager Name",
    specialOffers: "Free delivery for large orders",
    services: ["Fresh Produce", "Groceries", "Delivery", "Bulk Orders"],
    description: "Sample grocery store offering fresh produce and quality household items with delivery service.",
    detailedDescription: "Complete description of grocery store offerings, product range, delivery services, and quality standards. This is placeholder content for UI demonstration."
  },
  {
    id: 6,
    name: "Construction Company Sample",
    logo: "/logo-placeholder.png",
    category: "Construction",
    phone: "+92-XXX-XXX-XXXX",
    email: "projects@construction.com",
    website: "www.construction.com",
    address: "Office Address, City",
    established: "2008",
    owner: "Company Owner",
    specialOffers: "Free consultation for members",
    services: ["Construction", "Renovation", "Design", "Consultation"],
    description: "Sample construction company specializing in residential and commercial projects.",
    detailedDescription: "Detailed information about construction services, project experience, team expertise, and quality standards. This placeholder text demonstrates the content structure."
  },
  {
    id: 7,
    name: "Educational Institute Sample",
    logo: "/logo-placeholder.png",
    category: "Education",
    phone: "+92-XXX-XXX-XXXX",
    email: "admissions@education.com",
    website: "www.education.com",
    address: "Institute Address, City",
    established: "2016",
    owner: "Principal Name",
    specialOffers: "Scholarship opportunities for members",
    services: ["Primary Education", "Secondary", "Test Prep", "Skills Training"],
    description: "Sample educational institution providing quality education and skill development programs.",
    detailedDescription: "Comprehensive details about educational programs, faculty, facilities, and academic achievements. This sample content shows the information structure for real institutions."
  },
  {
    id: 8,
    name: "Event Venue Sample",
    logo: "/logo-placeholder.png",
    category: "Events & Venues",
    phone: "+92-XXX-XXX-XXXX",
    email: "bookings@venue.com",
    website: "www.venue.com",
    address: "Venue Location, City",
    established: "2014",
    owner: "Venue Owner",
    specialOffers: "Member booking discounts",
    services: ["Venue Rental", "Event Planning", "Catering", "Decoration"],
    description: "Sample event venue offering comprehensive event planning and catering services.",
    detailedDescription: "Full description of venue facilities, event services, capacity, and successful event history. This placeholder content demonstrates the layout for actual venue information."
  },
  {
    id: 9,
    name: "Tech Solutions Sample",
    logo: "/logo-placeholder.png",
    category: "Technology Services",
    phone: "+92-XXX-XXX-XXXX",
    email: "info@techsolutions.com",
    website: "www.techsolutions.com",
    address: "Office Address, City",
    established: "2019",
    owner: "Tech Lead Name",
    specialOffers: "Free consultation for community businesses",
    services: ["Web Development", "Digital Marketing", "IT Support", "Software Solutions"],
    description: "Sample technology company providing web development and digital marketing services.",
    detailedDescription: "Detailed overview of technology services, project portfolio, team expertise, and client success stories. This sample text represents the structure for actual business information."
  }
];

export async function getBusinesses(limit?: number) {
    if (limit === undefined) {
        return allCommunityBusinesses;
    }
    return allCommunityBusinesses.slice(0, limit);
}