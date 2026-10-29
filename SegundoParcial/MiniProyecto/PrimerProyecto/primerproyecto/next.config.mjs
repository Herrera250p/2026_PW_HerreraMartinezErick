

const MINI_SERVIDOR_URL = 'http://localhost:4000';
const BACKEND_URL = 'http://localhost:4000';

/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    async rewrites() {
        return[
            {source: '/mini/:path*', destination: `${MINI_SERVIDOR_URL}/:path*`},
            {source: '/api/:path*', destination: `${BACKEND_URL}/:path*`}
        ]
    }
}

export default nextConfig;
