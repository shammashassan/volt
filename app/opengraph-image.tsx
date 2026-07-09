import { ImageResponse } from 'next/og'

export const alt = 'Volt'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#070708',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '60px 40px',
        }}
      >
        {/* Subtle background ambient light */}
        <div
          style={{
            position: 'absolute',
            width: '600px',
            height: '600px',
            borderRadius: '300px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(0, 0, 0, 0) 70%)',
            top: '15px',
            left: '300px',
            opacity: 0.8,
          }}
        />

        {/* Branding Container */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
          }}
        >
          {/* Logo Mark (Volt symbol) */}
          <div
            style={{
              display: 'flex',
              width: '160px',
              height: '160px',
              marginBottom: '32px',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <svg
              viewBox="0 0 228 219"
              width="100%"
              height="100%"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
            >
              <path
                d="M0 6.01112C0 0.968169 5.84415 -1.8249 9.76855 1.34217L54.7686 37.6576C56.1798 38.7966 57 40.513 57 42.3265V123.588C57.0001 125.403 57.822 127.121 59.2354 128.26L106.265 166.158C107.678 167.297 108.5 169.014 108.5 170.829V212.08C108.5 217.002 102.901 219.83 98.9395 216.91L2.43945 145.757C0.905581 144.626 3.86605e-05 142.834 0 140.928V6.01112ZM217.731 1.34217C221.656 -1.8249 227.5 0.968169 227.5 6.01112V140.928C227.5 142.834 226.594 144.626 225.061 145.757L128.561 216.91C124.599 219.83 119 217.002 119 212.08V170.829C119 169.014 119.822 167.297 121.235 166.158L168.265 128.26C169.678 127.121 170.5 125.403 170.5 123.588V42.3265C170.5 40.513 171.32 38.7966 172.731 37.6576L217.731 1.34217ZM114 63.4584C126.15 63.4584 136 73.3082 136 85.4584C136 94.4197 130.641 102.128 122.954 105.558C122.984 105.854 123 106.154 123 106.458V134.458C123 139.429 118.971 143.458 114 143.458C109.029 143.458 105 139.429 105 134.458V106.458C105 106.154 105.015 105.854 105.045 105.558C97.3582 102.128 92 94.4194 92 85.4584C92.0001 73.3082 101.85 63.4584 114 63.4584Z"
                fill="#ffffff"
              />
            </svg>
          </div>

          {/* Title */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '20px',
            }}
          >
            <span
              style={{
                fontSize: '76px',
                fontWeight: 800,
                color: '#ffffff',
                letterSpacing: '-0.03em',
                fontFamily: 'system-ui, -apple-system, sans-serif',
              }}
            >
              Volt
            </span>
          </div>

          {/* Subtitle / Description */}
          <div
            style={{
              fontSize: '26px',
              fontWeight: 400,
              color: '#a1a1aa',
              textAlign: 'center',
              maxWidth: '750px',
              lineHeight: 1.5,
              fontFamily: 'system-ui, -apple-system, sans-serif',
            }}
          >
            Your personal knowledge, organized.
          </div>
        </div>

        {/* Footer info */}
        <div
          style={{
            position: 'absolute',
            bottom: '40px',
            left: '0',
            right: '0',
            display: 'flex',
            justifyContent: 'center',
            color: '#3f3f46',
            fontSize: '14px',
            fontWeight: 500,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            fontFamily: 'system-ui, -apple-system, sans-serif',
            zIndex: 10,
          }}
        >
          ui-volt.vercel.app
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}