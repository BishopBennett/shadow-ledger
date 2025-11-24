"use client";

import { designTokens } from "@/design-tokens";

export const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* 基础背景色 */}
      <div className="absolute inset-0 bg-background" />
      
      {/* 主渐变背景 */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(139, 92, 246, 0.15) 50%, rgba(168, 85, 247, 0.15) 100%)`,
        }}
      />
      
      {/* 动态渐变球体 */}
      <div className="absolute inset-0">
        <div
          className="absolute rounded-full"
          style={{
            width: "600px",
            height: "600px",
            background: `radial-gradient(circle, rgba(99, 102, 241, 0.4) 0%, rgba(99, 102, 241, 0.2) 40%, transparent 70%)`,
            filter: "blur(80px)",
            top: "-200px",
            left: "-200px",
            animation: "float1 20s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "500px",
            height: "500px",
            background: `radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, rgba(139, 92, 246, 0.2) 40%, transparent 70%)`,
            filter: "blur(80px)",
            top: "20%",
            right: "-150px",
            animation: "float2 25s ease-in-out infinite",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            width: "400px",
            height: "400px",
            background: `radial-gradient(circle, rgba(168, 85, 247, 0.4) 0%, rgba(168, 85, 247, 0.2) 40%, transparent 70%)`,
            filter: "blur(80px)",
            bottom: "-100px",
            left: "25%",
            animation: "float3 30s ease-in-out infinite",
          }}
        />
      </div>

      {/* 网格纹理 */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(99, 102, 241, 0.08) 1px, transparent 1px),
            linear-gradient(90deg, rgba(99, 102, 241, 0.08) 1px, transparent 1px)
          `,
          backgroundSize: "50px 50px",
        }}
      />
    </div>
  );
};

