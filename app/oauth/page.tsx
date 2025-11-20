'use client'

import { OAuthRedirect } from "@/components/OAuthRedirect";
import { Suspense } from "react";

export default function OAuthFourthwallWrapped() {
  return <Suspense fallback={<div>Loading...</div>}>
    <OAuthRedirect 
      authEndpoint={`/api/oauth`} 
      appRedirect={({ public_token, domain, name }) => `/?public_token=${public_token}&domain=${domain}&name=${name}`}
      message="Connecting your Fourthwall account..."
      redirectMessage="Taking you to your merch store..."
    />
  </Suspense>
}
