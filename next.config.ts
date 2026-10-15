import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ⭐️ 대용량 PDF 파일 업로드를 위해 용량 제한을 1MB에서 10MB로 늘립니다.
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  
  // 기존 설정 유지
  outputFileTracingIncludes: {
    '/api/**/*': ['./public/templates/**/*'],
  },
};

export default nextConfig;