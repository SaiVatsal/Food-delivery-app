export interface CityCentre {
  name: string;
  lat: number;
  lng: number;
}

export interface DeliveryPartnerStatic {
  name: string;
  phone: string;
  vehicleNo: string;
  rating: number;
}

export const CITY_CENTRE: CityCentre = {
  name: "Bengaluru",
  lat: 12.9716,
  lng: 77.5946,
};

export const SEEDED_DELIVERY_PARTNERS: DeliveryPartnerStatic[] = [
  {
    name: "Ramesh Kumar",
    phone: "98XXXXXX21",
    vehicleNo: "KA-01-EA-1021",
    rating: 4.8,
  },
  {
    name: "Suresh Patel",
    phone: "98XXXXXX34",
    vehicleNo: "KA-02-MB-4534",
    rating: 4.9,
  },
  {
    name: "Priya Sharma",
    phone: "97XXXXXX56",
    vehicleNo: "KA-03-TC-8856",
    rating: 4.7,
  },
  {
    name: "Amit Verma",
    phone: "99XXXXXX78",
    vehicleNo: "KA-04-JD-1278",
    rating: 4.9,
  },
  {
    name: "Deepa Rao",
    phone: "96XXXXXX90",
    vehicleNo: "KA-05-KN-3490",
    rating: 4.8,
  },
  {
    name: "Vikram Singh",
    phone: "98XXXXXX12",
    vehicleNo: "KA-01-PL-5612",
    rating: 4.6,
  },
  {
    name: "Rajesh Nair",
    phone: "97XXXXXX43",
    vehicleNo: "KA-02-RX-7843",
    rating: 4.9,
  },
  {
    name: "Anjali Joshi",
    phone: "99XXXXXX65",
    vehicleNo: "KA-03-QW-9065",
    rating: 4.8,
  },
  {
    name: "Mohammed Ali",
    phone: "96XXXXXX87",
    vehicleNo: "KA-04-VB-2387",
    rating: 4.7,
  },
  {
    name: "Karthik Reddy",
    phone: "98XXXXXX09",
    vehicleNo: "KA-05-ZX-6709",
    rating: 4.9,
  },
];

export const ORDER_STATUSES = [
  "Placed",
  "Preparing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const CUISINES = [
  "All",
  "Biryani",
  "North Indian",
  "South Indian",
  "Pizza",
  "Burgers",
  "Desserts",
  "Chinese",
] as const;
