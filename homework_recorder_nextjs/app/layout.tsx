export const metadata = {
  title: "学习机英语作业录制",
  description: "儿童语音引导版英语作业录制网页",
};

import "./globals.css";
import type { ReactNode } from "react";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}