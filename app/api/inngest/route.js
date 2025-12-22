import { serve } from "inngest/next";
import { createUserOrder, inngest } from "@/config/inngest";
import {
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
} from "@/config/inngest";

// Create an API that serves zero functions
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    /* your functions will be passed here later! */
    syncUserCreation,
    syncUserDeletion,
    syncUserUpdation,
    createUserOrder,
  ],
});
