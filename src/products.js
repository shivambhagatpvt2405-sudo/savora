
const categories = {
  Electronics: [
    "Wireless Earbuds",
    "Bluetooth Speaker",
    "Wireless Mouse",
    "Mechanical Keyboard",
    "Power Bank",
    "Smart Watch",
    "USB-C Hub",
    "Webcam",
    "Laptop Stand",
    "Phone Holder",
  ],
  "Home & Kitchen": [
    "Water Bottle",
    "Coffee Mug",
    "LED Desk Lamp",
    "Bedsheet Set",
    "Storage Container",
    "Frying Pan",
    "Food Chopper",
    "Laundry Organizer",
    "Cushion Cover",
    "Shopping Bag",
  ],
  Fashion: [
    "Cotton T-Shirt",
    "Casual Sneakers",
    "Canvas Backpack",
    "Minimalist Wallet",
    "Wrist Watch",
    "Sunglasses",
    "Cotton Scarf",
    "Travel Duffel Bag",
    "Casual Belt",
    "Running Cap",
  ],
  "Beauty & Personal Care": [
    "Hair Dryer",
    "Grooming Kit",
    "Makeup Organizer",
    "Bath Towel Set",
    "Hand Mirror",
    "Nail Care Kit",
    "Hair Brush",
    "Travel Pouch",
    "Face Cleansing Brush",
    "Spray Bottle",
  ],
  "Sports & Outdoors": [
    "Yoga Mat",
    "Resistance Bands",
    "Sports Bottle",
    "Camping Lantern",
    "Jump Rope",
    "Gym Duffel Bag",
    "Hiking Backpack",
    "Cycling Gloves",
    "Foam Roller",
    "Fitness Gloves",
  ],
};

const adjectives = [
  "Classic",
  "Modern",
  "Premium",
  "Essential",
  "Smart",
  "Compact",
  "Everyday",
  "Urban",
  "Pro",
  "Versatile",
];

const colors = [
  "Black",
  "White",
  "Blue",
  "Grey",
  "Green",
  "Red",
  "Navy",
  "Brown",
  "Silver",
  "Beige",
];

const features = [
  "Practical everyday design",
  "Easy to use",
  "Compact and convenient",
  "Suitable for daily use",
  "Easy to maintain",
];

const products = [];
let id = 1;

Object.entries(categories).forEach(([category, items]) => {
  items.forEach((item) => {
    adjectives.forEach((style, index) => {
      const name = `${style} ${item}`;

      products.push({
        id,
        name,
        brand: `Savora Demo ${category.split(" ")[0]}`,
        category,
        price: 299 + index * 200,
        currency: "INR",
        rating: Number((3.8 + index * 0.1).toFixed(1)),
        reviewCount: 0,
        color: colors[index],
        description:
          `${name} is a demo product listed in ${category}. ` +
          "Explore its details and compare available shopping options.",

        longDescription:
          `${name} is part of the Savora demonstration catalog. ` +
          "This listing demonstrates product discovery, filtering, " +
          "product details, and shopping links. Actual specifications, " +
          "materials, availability, and performance must be verified " +
          "with the retailer before purchase.",

        features: [
          features[index % features.length],
          `Color option: ${colors[index]}`,
          "Demo catalog listing",
        ],

        specifications: {
          Category: category,
          Style: style,
          Color: colors[index],
          Price: `₹${(299 + index * 200).toLocaleString("en-IN")} (demo)`,
          Availability: "Check retailer",
          Warranty: "Check retailer",
        },

        productHistory:
          "Demo listing. Verified manufacturing and release history " +
          "is not available.",

        image: "",
        affiliateUrl: "",
        buyUrl:
          "https://www.amazon.in/s?k=" +
          encodeURIComponent(name),

        isDemo: true,
      });

      id++;
    });
  });
});

export default products;