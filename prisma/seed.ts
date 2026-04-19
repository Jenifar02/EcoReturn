import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Demo admin user
  const adminPassword = await bcrypt.hash('admin123', 12)
  await prisma.user.upsert({
    where:  { email: 'admin@ecoreturnn.com' },
    update: {},
    create: {
      name:     'Admin User',
      email:    'admin@ecoreturnn.com',
      phone:    '01700000000',
      password: adminPassword,
      role:     'ADMIN',
    },
  })

  // Demo regular user
  const userPassword = await bcrypt.hash('user1234', 12)
  await prisma.user.upsert({
    where:  { email: 'demo@ecoreturnn.com' },
    update: {},
    create: {
      name:     'Demo User',
      email:    'demo@ecoreturnn.com',
      phone:    '01800000000',
      password: userPassword,
      role:     'USER',
    },
  })

  // Seed locations
  const locations = [
    { name: 'Dhaka University',     area: 'TSC area',    city: 'Dhaka',       district: 'Dhaka',       status: 'ACTIVE'  as const },
    { name: 'Dhanmondi',            area: 'Road 27',     city: 'Dhaka',       district: 'Dhaka',       status: 'ACTIVE'  as const },
    { name: 'Mirpur DOHS',          area: 'Section 11',  city: 'Dhaka',       district: 'Dhaka',       status: 'ACTIVE'  as const },
    { name: 'BUET Campus',          area: 'Near cafeteria', city: 'Dhaka',    district: 'Dhaka',       status: 'ACTIVE'  as const },
    { name: 'Narayanganj Chashara', area: 'Bus stand',   city: 'Narayanganj', district: 'Narayanganj', status: 'ACTIVE'  as const },
    { name: 'Chattogram GEC',       area: 'GEC circle',  city: 'Chattogram',  district: 'Chattogram',  status: 'PLANNED' as const },
    { name: 'Sylhet Zindabazar',    area: 'Main road',   city: 'Sylhet',      district: 'Sylhet',      status: 'PLANNED' as const },
  ]

  for (const loc of locations) {
    await prisma.location.upsert({
      where:  { id: loc.name.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: { ...loc, id: loc.name.toLowerCase().replace(/ /g, '-') },
    }).catch(() => prisma.location.create({ data: loc }))
  }

  console.log('✅ Seed complete!')
  console.log('👤 Demo login: demo@ecoreturnn.com / user1234')
  console.log('🔑 Admin login: admin@ecoreturnn.com / admin123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
