import localFont from "next/font/local";

export const neueMontreal = localFont({
  src: [
    {
      path: "./Neue/NeueMontreal-Light.woff2",
      weight: "200",
      style: "normal",
    },
    {
      path: "./Neue/NeueMontreal-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./Neue/NeueMontreal-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./Neue/NeueMontreal-Bold.woff2",
      weight: "700",
      style: "normal",
    },

    //italics
    {
      path: "./Neue/NeueMontreal-LightItalic.woff2",
      weight: "200",
      style: "italic",
    },
    {
      path: "./Neue/NeueMontreal-Italic.woff2",
      weight: "400",
      style: "italic",
    },
    {
      path: "./Neue/NeueMontreal-MediumItalic.woff2",
      weight: "500",
      style: "italic",
    },
    {
      path: "./Neue/NeueMontreal-BoldItalic.woff2",
      weight: "700",
      style: "italic",
    },
  ],
  variable: "--font-neue-montreal",
  display: "swap",
});
