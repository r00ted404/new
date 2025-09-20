export interface EmailProvider {
  name: string;
  logo: string;
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
  buttonColor: string;
  buttonTextColor: string;
}

export const EMAIL_PROVIDERS: Record<string, EmailProvider> = {
  gmail: {
    name: "Gmail",
    logo: "/gmail.jpg",
    primaryColor: "#ea4335",
    backgroundColor: "#ffffff",
    textColor: "#202124",
    buttonColor: "#1a73e8",
    buttonTextColor: "#ffffff",
  },
  yahoo: {
    name: "Yahoo",
    logo: "/yahoo.jpg",
    primaryColor: "#6001d2",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    buttonColor: "#6001d2",
    buttonTextColor: "#ffffff",
  },
  aol: {
    name: "AOL",
    logo: "/aol.png",
    primaryColor: "#000000",
    backgroundColor: "#ffffff",
    textColor: "#000000",
    buttonColor: "#000000",
    buttonTextColor: "#ffffff",
  },
  proton: {
    name: "Proton",
    logo: "/proton.jpeg",
    primaryColor: "#6d4aff",
    backgroundColor: "#ffffff",
    textColor: "#0c0c14",
    buttonColor: "#6d4aff",
    buttonTextColor: "#ffffff",
  },
  outlook: {
    name: "Outlook",
    logo: "/office,outlook,hotmail.png",
    primaryColor: "#0078d4",
    backgroundColor: "#ffffff",
    textColor: "#323130",
    buttonColor: "#0078d4",
    buttonTextColor: "#ffffff",
  },
  hotmail: {
    name: "Hotmail",
    logo: "/office,outlook,hotmail.png",
    primaryColor: "#0078d4",
    backgroundColor: "#ffffff",
    textColor: "#323130",
    buttonColor: "#0078d4",
    buttonTextColor: "#ffffff",
  },
  default: {
    name: "Email",
    logo: "/mail.webp",
    primaryColor: "#6b7280",
    backgroundColor: "#ffffff",
    textColor: "#374151",
    buttonColor: "#6b7280",
    buttonTextColor: "#ffffff",
  },
};

export function detectEmailProvider(email: string): EmailProvider {
  if (!email || !email.includes("@")) return EMAIL_PROVIDERS.default;

  const domain = email.split("@")[1]?.toLowerCase();

  if (domain?.includes("gmail")) return EMAIL_PROVIDERS.gmail;
  if (domain?.includes("yahoo")) return EMAIL_PROVIDERS.yahoo;
  if (domain?.includes("aol")) return EMAIL_PROVIDERS.aol;
  if (domain?.includes("proton")) return EMAIL_PROVIDERS.proton;
  if (domain?.includes("outlook")) return EMAIL_PROVIDERS.outlook;
  if (domain?.includes("hotmail")) return EMAIL_PROVIDERS.hotmail;
  if (domain?.includes("live.com")) return EMAIL_PROVIDERS.outlook;

  return EMAIL_PROVIDERS.default;
}


