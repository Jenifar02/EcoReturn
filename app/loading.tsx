export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin mx-auto mb-4"
          style={{
            borderColor: 'rgba(46,125,50,0.15)',
            borderTopColor: '#2e7d32',
          }}
        />
        <p className="font-semibold opacity-60 text-sm">Loading...</p>
      </div>
    </div>
  )
}
