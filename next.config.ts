import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 기존에 있던 다른 설정들이 있다면 이 위치에 그대로 유지하세요.
  
  // ⭐️ experimental 밖으로 꺼내서 최상단에 배치합니다.
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/templates/**/*'],
  },
};

export default nextConfig;
