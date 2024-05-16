import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { createClient } from "@/common/data/database/supabase/clients/component";

const Index = () => {
  const router = useRouter();
  const supabaseClient = createClient();

  // useEffect(() => {
  //   supabaseClient.auth.getSession().then(({ data: { session } }) => {
  //     if (!session) {
  //       router.push("/login");
  //     } else {
  //       router.push("/homebase");
  //     }
  //   });
  // }, []);

  return <p className="m-4 text-gray-200 text-md">Redirecting...</p>;
};

export default Index;
