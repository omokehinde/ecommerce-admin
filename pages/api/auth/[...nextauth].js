import NextAuth, { getServerSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@auth/mongodb-adapter";

import clientPromise from "../../../lib/mongodb";

const adminEmails = ['engr.omokehinde@gmail.com'];

export const authOptions = {
  // Configure one or more authentication providers
  providers: [
    GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        // authorization: {
        //     params: {
        //       prompt: "consent",
        //       access_type: "offline",
        //       response_type: "code"
        //     }
        //   },
        profile(profile) {
          return {
            // Return all the profile information you need.
            // The only truly required field is `id`
            // to be able identify the account when added to a database
            id: profile.sub,
            name: profile.name,
            firstname: profile.given_name,
            lastname: profile.family_name,
            email: profile.email,
            image: profile.picture,

          }
        },
      }),
    // ...add more providers here
  ],
  secret: process.env.NEXT_PUBLIC_SECRET,
  adapter: MongoDBAdapter(clientPromise),
  callbacks: {
    session: ({session,token,user}) => {
      if (adminEmails.includes(session?.user?.email)) {
        return session;
      } else {
        return false;
      }
    },
  },
}

export default NextAuth(authOptions);

export async function isAdminRequest(req,res) {
  const session = await getServerSession(req,res,authOptions);
  if (!adminEmails.includes(session?.user?.email)) {
    res.status(401);
    res.end();
    throw 'Not an Admin';
  }
}