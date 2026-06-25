"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { COMPANY } from "@/lib/data";

export type SiteContact = {
  phone: string;
  phone2: string;
  email: string;
  address: string;
  whatsapp: string;
  facebook: string;
  instagram: string;
  twitter: string;
  youtube: string;
  tiktok: string;
};

const DEFAULT: SiteContact = {
  phone:     COMPANY.phone,
  phone2:    COMPANY.phone2,
  email:     COMPANY.email,
  address:   COMPANY.address,
  whatsapp:  COMPANY.social.whatsapp,
  facebook:  COMPANY.social.facebook,
  instagram: COMPANY.social.instagram,
  twitter:   COMPANY.social.twitter,
  youtube:   COMPANY.social.youtube,
  tiktok:    "",
};

export function useSiteContact(): SiteContact {
  const [contact, setContact] = useState<SiteContact>(DEFAULT);

  useEffect(() => {
    createClient()
      .from("site_settings")
      .select("key, value")
      .in("category", ["contact", "social"])
      .then(({ data }) => {
        if (!data?.length) return;
        const m: Record<string, string> = {};
        for (const row of data) m[row.key] = row.value;
        setContact({
          phone:     m.contact_phone_primary  || DEFAULT.phone,
          phone2:    m.contact_phone_secondary || DEFAULT.phone2,
          email:     m.contact_email           || DEFAULT.email,
          address:   m.contact_address         || DEFAULT.address,
          whatsapp:  m.contact_whatsapp         || DEFAULT.whatsapp,
          facebook:  m.social_facebook          || DEFAULT.facebook,
          instagram: m.social_instagram         || DEFAULT.instagram,
          twitter:   m.social_twitter           || DEFAULT.twitter,
          youtube:   m.social_youtube           || DEFAULT.youtube,
          tiktok:    m.social_tiktok            || DEFAULT.tiktok,
        });
      });
  }, []);

  return contact;
}
