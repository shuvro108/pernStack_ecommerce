import gs_logo from "./gs_logo.jpg";
import happy_store from "./happy_store.webp";
import upload_area from "./upload_area.svg";
import hero_model_img from "./hero_model_img.png";
import hero_product_img1 from "./hero_product_img1.png";
import hero_product_img2 from "./hero_product_img2.png";
import product_img1 from "./product_img1.png";
import product_img2 from "./product_img2.png";
import product_img3 from "./product_img3.png";
import product_img4 from "./product_img4.png";
import product_img5 from "./product_img5.png";
import product_img6 from "./product_img6.png";
import product_img7 from "./product_img7.png";
import product_img8 from "./product_img8.png";
import product_img9 from "./product_img9.png";
import product_img10 from "./product_img10.png";
import product_img11 from "./product_img11.png";
import product_img12 from "./product_img12.png";
import { ClockFadingIcon, HeadsetIcon, SendIcon } from "lucide-react";
import profile_pic1 from "./profile_pic1.jpg";
import profile_pic2 from "./profile_pic2.jpg";
import profile_pic3 from "./profile_pic3.jpg";

export const assets = {
  upload_area,
  hero_model_img,
  hero_product_img1,
  hero_product_img2,
  gs_logo,
  product_img1,
  product_img2,
  product_img3,
  product_img4,
  product_img5,
  product_img6,
  product_img7,
  product_img8,
  product_img9,
  product_img10,
  product_img11,
  product_img12,
};

export const categories = [
  "Handwoven Baskets",
  "Textiles & Apparel",
  "Bamboo Decor",
  "Pottery & Ceramics",
  "Wood Crafts",
  "Jewelry & Accessories",
];

export const dummyRatingsData = [
  {
    id: "rat_1",
    rating: 4.2,
    review:
      "Absolutely beautiful craftsmanship! You can really see the care and dedication that went into making this piece. It's a unique find that beautifully highlights local artistry.",
    user: { name: "Kristin Watson", image: profile_pic1 },
    productId: "prod_1",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    product: {
      name: "Bluetooth Speakers",
      category: "Electronics",
      id: "prod_1",
    },
  },
  {
    id: "rat_2",
    rating: 5.0,
    review:
      "A wonderful, unique piece. It arrived safely and is exactly as described. The quality of the materials and the finished product is superb for a handcrafted item.",
    user: { name: "Jenny Wilson", image: profile_pic2 },
    productId: "prod_2",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    product: {
      name: "Bluetooth Speakers",
      category: "Electronics",
      id: "prod_1",
    },
  },
  {
    id: "rat_3",
    rating: 4.1,
    review:
      "Very happy with this purchase. The material is high quality and the finished product feels very sturdy. I feel good supporting a local artisan.",
    user: { name: "Bessie Cooper", image: profile_pic3 },
    productId: "prod_3",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    product: {
      name: "Bluetooth Speakers",
      category: "Electronics",
      id: "prod_1",
    },
  },
  {
    id: "rat_4",
    rating: 5.0,
    review:
      "Such a one-of-a-kind treasure! It's clear this was made with love and skill. It makes a perfect, thoughtful gift.",
    user: { name: "Kristin Watson", image: profile_pic1 },
    productId: "prod_4",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    product: {
      name: "Bluetooth Speakers",
      category: "Electronics",
      id: "prod_1",
    },
  },
  {
    id: "rat_5",
    rating: 4.3,
    review:
      "The item is lovely and high-quality, though the shipping took slightly longer than expected. Still, it's a genuine handcrafted piece and I'm pleased with the product itself.",
    user: { name: "Jenny Wilson", image: profile_pic2 },
    productId: "prod_5",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    product: {
      name: "Bluetooth Speakers",
      category: "Electronics",
      id: "prod_1",
    },
  },
  {
    id: "rat_6",
    rating: 5.0,
    review:
      "Five stars! The level of detail and care in this item is exceptional. It’s a joy to own something truly handcrafted and local.",
    user: { name: "Bessie Cooper", image: profile_pic3 },
    productId: "prod_6",
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    product: {
      name: "Bluetooth Speakers",
      category: "Electronics",
      id: "prod_1",
    },
  },
];

export const dummyStoreData = {
  id: "store_1",
  userId: "user_1",
  name: "Happy Shop",
  description:
    "At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
  username: "happyshop",
  address:
    "3rd Floor, Happy Shop , New Building, 123 street , c sector , NY, US",
  status: "approved",
  isActive: true,
  logo: happy_store,
  email: "happyshop@example.com",
  contact: "+0 1234567890",
  createdAt: "2025-09-04T09:04:16.189Z",
  updatedAt: "2025-09-04T09:04:44.273Z",
  user: {
    id: "user_31dOriXqC4TATvc0brIhlYbwwc5",
    name: "Great Stack",
    email: "user.greatstack@gmail.com",
    image: gs_logo,
  },
};

export const productDummyData = [
  {
    id: "prod_1",
    name: "Bamboo Wood Shelf",
    description:
      "Elevate your home decor with this versatile Bamboo Wood Shelf. Crafted from 100% natural, eco-friendly bamboo, its clean lines and warm wood tone complement both modern and traditional styles. Use it in the bathroom for towels, the kitchen for spices, or the living room as a beautiful display piece. Durable, moisture-resistant, and designed for easy, quick assembly.",
    mrp: 40,
    price: 29,
    images: [product_img1, product_img2, product_img3, product_img4],
    category: "Bamboo Decor",
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    rating: dummyRatingsData,
    createdAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 29 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_2",
    name: "Woven Bamboo Lamp",
    description:
      "Illuminate your room with the tranquil beauty of our Woven Bamboo Lamp. The open-weave construction of the bamboo shade creates captivating light patterns, making it a perfect accent piece for bohemian, minimalist, or coastal styles. Each lamp is a one-of-a-kind handcrafted item, ensuring you receive a unique and sustainable piece of art.",
    mrp: 50,
    price: 29,
    images: [product_img2],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Bamboo Decor",
    rating: dummyRatingsData,
    createdAt: "Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 28 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_3",
    name: "Elephant Grass Hamper",
    description:
      "Organize your space with this stunning Elephant Grass Hamper, a true example of traditional craftsmanship. Handwoven by skilled artisans, this durable basket is made from sustainably harvested elephant grass, giving it a beautiful natural texture and sturdy structure. Perfect for use as a laundry hamper, toy storage, or simply as a stylish decorative piece in any room. Its robust quality ensures it will last for years, adding an authentic, organic touch to your home decor.",
    mrp: 60,
    price: 29,
    images: [product_img3],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Handwoven Baskets",
    rating: dummyRatingsData,
    createdAt: "Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 27 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_4",
    name: "Pinon Hadi",
    description:
      "The Pinon Hadi is the traditional dress of Chakma women from the Chittagong Hill Tracts. It includes two main parts — the Pinon (a wraparound skirt) and the Hadi (a breast cloth or shawl). Each piece is handwoven with colorful patterns that reflect Chakma culture and craftsmanship. Wearing a Pinon Hadi represents tradition, beauty, and the rich heritage of the Chakma people.",
    mrp: 70,
    price: 29,
    images: [product_img4],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Textiles & Apparel",
    rating: dummyRatingsData,
    createdAt: "Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 26 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_5",
    name: "Traditional Panjabi",
    description:
      "This traditional Panjabi is a proud symbol of Chakma heritage and craftsmanship. Worn by Chakma men during festivals, ceremonies, and cultural events, it showcases exquisite handwoven designs inspired by traditional patterns. Made from high-quality fabric, each Panjabi features vibrant colors and intricate embroidery that reflect the artistry and cultural pride of the Chakma community — blending tradition with timeless elegance.",
    mrp: 49,
    price: 29,
    images: [product_img5],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Textiles & Apparel",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_6",
    name: "HandLathed Woden Bowl",
    description:
      "A beautifully handcrafted wooden bowl made on a traditional lathe. Its smooth finish and natural wood grain make it perfect for serving or decoration, adding a touch of rustic elegance to any home.",
    mrp: 59,
    price: 29,
    images: [product_img6],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Wood Crafts",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 25 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_7",
    name: "Stoneware Succulent Plante",
    description:
      "A stylish handcrafted stoneware planter designed for succulents and small plants. Its durable build and elegant finish make it a perfect addition to any indoor or outdoor space.",
    mrp: 89,
    price: 29,
    images: [product_img7],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Pottery & Ceramics",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 24 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_8",
    name: "Wood Resin Bangle",
    description:
      "A unique handcrafted bangle made from a blend of natural wood and resin. Its smooth texture and striking design make it a perfect accessory that combines nature’s charm with modern style.",
    mrp: 99,
    price: 29,
    images: [product_img8],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Jewelry & Accessories",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 23 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_9",
    name: "Handwoven Baskets",
    description:
      "Beautifully crafted baskets made from natural fibers by skilled artisans. These durable and eco-friendly baskets are perfect for storage, decoration, or gifting, showcasing traditional weaving artistry.",
    mrp: 89,
    price: 29,
    images: [product_img9],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Handwoven Baskets",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 22 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_10",
    name: "Bamboo Room Screen",
    description:
      "A finely crafted room divider made from natural bamboo. This lightweight and eco-friendly screen adds a touch of elegance and privacy to any space while reflecting traditional craftsmanship.",
    mrp: 179,
    price: 29,
    images: [product_img10],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Bamboo Decor",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 21 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_11",
    name: "Coiled Cotton Rope Nursery Bin",
    description:
      "Keep your nursery organized with this handwoven coiled cotton rope bin. Soft yet durable, it’s perfect for storing toys, clothes, diapers, and blankets. Lightweight and portable, it adds a cozy, handcrafted touch to any nursery decor. Durable, practical, and stylish—an ideal storage solution for everyday use",
    mrp: 39,
    price: 29,
    images: [product_img11],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Handwoven Baskets",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 20 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
  {
    id: "prod_12",
    name: "Handwoven Bead Choker",
    description:
      "A stylish handwoven choker crafted with colorful beads, perfect for adding a touch of elegance to any outfit. Lightweight, comfortable, and versatile, it complements both casual and dressy looks.",
    mrp: 199,
    price: 29,
    images: [product_img12],
    storeId: "seller_1",
    inStock: true,
    store: dummyStoreData,
    category: "Jewelry & Accessories",
    rating: [...dummyRatingsData, ...dummyRatingsData],
    createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
    updatedAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
  },
];

export const ourSpecsData = [
  {
    title: "Free Shipping",
    description:
      "Enjoy fast, free delivery on every order no conditions, just reliable doorstep.",
    icon: SendIcon,
    accent: "#05DF72",
  },
  {
    title: "7 Days easy Return",
    description: "Change your mind? No worries. Return any item within 7 days.",
    icon: ClockFadingIcon,
    accent: "#FF8904",
  },
  {
    title: "24/7 Customer Support",
    description:
      "We're here for you. Get expert help with our customer support.",
    icon: HeadsetIcon,
    accent: "#A684FF",
  },
];

export const addressDummyData = {
  id: "addr_1",
  userId: "user_1",
  name: "John Doe",
  email: "johndoe@example.com",
  street: "123 Main St",
  city: "New York",
  state: "NY",
  zip: "10001",
  country: "USA",
  phone: "1234567890",
  createdAt: "Sat Jul 19 2025 14:51:25 GMT+0530 (India Standard Time)",
};

export const couponDummyData = [
  {
    code: "NEW20",
    description: "20% Off for New Users",
    discount: 20,
    forNewUser: true,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:31.183Z",
  },
  {
    code: "NEW10",
    description: "10% Off for New Users",
    discount: 10,
    forNewUser: true,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:35:50.653Z",
  },
  {
    code: "OFF20",
    description: "20% Off for All Users",
    discount: 20,
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:42:00.811Z",
  },
  {
    code: "OFF10",
    description: "10% Off for All Users",
    discount: 10,
    forNewUser: false,
    forMember: false,
    isPublic: false,
    expiresAt: "2026-12-31T00:00:00.000Z",
    createdAt: "2025-08-22T08:42:21.279Z",
  },
  {
    code: "PLUS10",
    description: "20% Off for Members",
    discount: 10,
    forNewUser: false,
    forMember: true,
    isPublic: false,
    expiresAt: "2027-03-06T00:00:00.000Z",
    createdAt: "2025-08-22T11:38:20.194Z",
  },
];

export const dummyUserData = {
  id: "user_31dQbH27HVtovbs13X2cmqefddM",
  name: "GreatStack",
  email: "greatstack@example.com",
  image: gs_logo,
  cart: {},
};

export const orderDummyData = [
  {
    id: "cmemm75h5001jtat89016h1p3",
    total: 214.2,
    status: "DELIVERED",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    storeId: "cmemkqnzm000htat8u7n8cpte",
    addressId: "cmemm6g95001ftat8omv9b883",
    isPaid: false,
    paymentMethod: "COD",
    createdAt: "2025-08-22T09:15:03.929Z",
    updatedAt: "2025-08-22T09:15:50.723Z",
    isCouponUsed: true,
    coupon: dummyRatingsData[2],
    orderItems: [
      {
        orderId: "cmemm75h5001jtat89016h1p3",
        productId: "cmemlydnx0017tat8h3rg92hz",
        quantity: 1,
        price: 89,
        product: productDummyData[0],
      },
      {
        orderId: "cmemm75h5001jtat89016h1p3",
        productId: "cmemlxgnk0015tat84qm8si5v",
        quantity: 1,
        price: 149,
        product: productDummyData[1],
      },
    ],
    address: addressDummyData,
    user: dummyUserData,
  },
  {
    id: "cmemm6jv7001htat8vmm3gxaf",
    total: 421.6,
    status: "DELIVERED",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    storeId: "cmemkqnzm000htat8u7n8cpte",
    addressId: "cmemm6g95001ftat8omv9b883",
    isPaid: false,
    paymentMethod: "COD",
    createdAt: "2025-08-22T09:14:35.923Z",
    updatedAt: "2025-08-22T09:15:52.535Z",
    isCouponUsed: true,
    coupon: couponDummyData[0],
    orderItems: [
      {
        orderId: "cmemm6jv7001htat8vmm3gxaf",
        productId: "cmemm1f3y001dtat8liccisar",
        quantity: 1,
        price: 229,
        product: productDummyData[2],
      },
      {
        orderId: "cmemm6jv7001htat8vmm3gxaf",
        productId: "cmemm0nh2001btat8glfvhry1",
        quantity: 1,
        price: 99,
        product: productDummyData[3],
      },
      {
        orderId: "cmemm6jv7001htat8vmm3gxaf",
        productId: "cmemlz8640019tat8kz7emqca",
        quantity: 1,
        price: 199,
        product: productDummyData[4],
      },
    ],
    address: addressDummyData,
    user: dummyUserData,
  },
];

export const storesDummyData = [
  {
    id: "cmemkb98v0001tat8r1hiyxhn",
    userId: "user_31dOriXqC4TATvc0brIhlYbwwc5",
    name: "GreatStack",
    description:
      "GreatStack is the education marketplace where you can buy goodies related to coding and tech",
    username: "greatstack",
    address: "123 Maplewood Drive Springfield, IL 62704 USA",
    status: "approved",
    isActive: true,
    logo: gs_logo,
    email: "greatstack@example.com",
    contact: "+0 1234567890",
    createdAt: "2025-08-22T08:22:16.189Z",
    updatedAt: "2025-08-22T08:22:44.273Z",
    user: dummyUserData,
  },
  {
    id: "cmemkqnzm000htat8u7n8cpte",
    userId: "user_31dQbH27HVtovbs13X2cmqefddM",
    name: "Happy Shop",
    description:
      "At Happy Shop, we believe shopping should be simple, smart, and satisfying. Whether you're hunting for the latest fashion trends, top-notch electronics, home essentials, or unique lifestyle products — we've got it all under one digital roof.",
    username: "happyshop",
    address:
      "3rd Floor, Happy Shop , New Building, 123 street , c sector , NY, US",
    status: "approved",
    isActive: true,
    logo: happy_store,
    email: "happyshop@example.com",
    contact: "+0 123456789",
    createdAt: "2025-08-22T08:34:15.155Z",
    updatedAt: "2025-08-22T08:34:47.162Z",
    user: dummyUserData,
  },
];

export const dummyAdminDashboardData = {
  orders: 6,
  stores: 2,
  products: 12,
  revenue: "959.10",
  allOrders: [
    { createdAt: "2025-08-20T08:46:58.239Z", total: 145.6 },
    { createdAt: "2025-08-22T08:46:21.818Z", total: 97.2 },
    { createdAt: "2025-08-22T08:45:59.587Z", total: 54.4 },
    { createdAt: "2025-08-23T09:15:03.929Z", total: 214.2 },
    { createdAt: "2025-08-23T09:14:35.923Z", total: 421.6 },
    { createdAt: "2025-08-23T11:44:29.713Z", total: 26.1 },
    { createdAt: "2025-08-24T09:15:03.929Z", total: 214.2 },
    { createdAt: "2025-08-24T09:14:35.923Z", total: 421.6 },
    { createdAt: "2025-08-24T11:44:29.713Z", total: 26.1 },
    { createdAt: "2025-08-24T11:56:29.713Z", total: 36.1 },
    { createdAt: "2025-08-25T11:44:29.713Z", total: 26.1 },
    { createdAt: "2025-08-25T09:15:03.929Z", total: 214.2 },
    { createdAt: "2025-08-25T09:14:35.923Z", total: 421.6 },
    { createdAt: "2025-08-25T11:44:29.713Z", total: 26.1 },
    { createdAt: "2025-08-25T11:56:29.713Z", total: 36.1 },
    { createdAt: "2025-08-25T11:30:29.713Z", total: 110.1 },
  ],
};

export const dummyStoreDashboardData = {
  ratings: dummyRatingsData,
  totalOrders: 2,
  totalEarnings: 636,
  totalProducts: 5,
};
