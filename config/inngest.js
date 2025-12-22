import { Inngest } from "inngest";
import connectDB from "./db.js";
import prisma from "@/lib/prisma";

// import { connect } from "mongoose";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "terracotta-handicrafts" });

//Inngest Function to save user data to a database
export const syncUserCreation = inngest.createFunction(
  {
    id: "sync-user-from-clerk",
  },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      imageUrl: image_url,
      cartItems: {},
    };

    await connectDB();
    await prisma.user.upsert({
      where: { id },
      update: userData,
      create: {
        id,
        name: userData.name,
        email: userData.email,
        imageUrl: userData.imageUrl,
        cartItems: {},
      },
    });
  }
);

//Inngest Function to update user data in database
export const syncUserUpdation = inngest.createFunction(
  {
    id: "update-user-from-clerk",
  },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { id, first_name, last_name, email_addresses, image_url } =
      event.data;
    const userData = {
      _id: id,
      name: `${first_name} ${last_name}`,
      email: email_addresses[0].email_address,
      imageUrl: image_url,
    };

    await connectDB();
    await prisma.user.update({ where: { id }, data: userData });
  }
);

//Inngest Function to delete user data from database
export const syncUserDeletion = inngest.createFunction(
  {
    id: "delete-user-from-clerk",
  },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { id } = event.data;

    await connectDB();
    await prisma.user.delete({ where: { id } });
  }
);

export const createUserOrder = inngest.createFunction(
  {
    id: "create-user-order",
    batchEvents: {
      maxSize: 5,
      timeout: "5s",
    },
  },
  { event: "order/created" },
  async ({ events }) => {
    const orders = events.map((event) => {
      return {
        userId: event.data.userId,
        items: event.data.items,
        amount: event.data.amount,
        address: event.data.address,
        date: event.data.date,
      };
    });
    await connectDB();
    for (const o of orders) {
      await prisma.order.create({
        data: {
          userId: o.userId,
          amount: o.amount,
          addressId: Number.isInteger(Number(o.address))
            ? Number(o.address)
            : undefined,
          date: BigInt(o.date),
          status: "ORDER_PLACED",
          items: {
            create: o.items.map((it) => ({
              productId: Number(it.product),
              quantity: it.quantity,
            })),
          },
        },
      });
    }
    return { success: true, processed: orders.length };
  }
);
