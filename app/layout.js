import './globals.css'

export const metadata = {
  title: 'Thrive - Fitness & Nutrition Mentor',
  description: 'Track your fitness journey and reach your goals',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}