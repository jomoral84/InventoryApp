import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Ejecutando seed...')

  // Verificar si ya existen usuarios
  const count = await prisma.user.count()
  if (count > 0) {
    console.log('✅ La base de datos ya tiene usuarios, se omite el seed.')
    return
  }

  const adminHash = bcrypt.hashSync('admin123', 10)
  const userHash = bcrypt.hashSync('user123', 10)

  await prisma.user.create({
    data: {
      username: 'admin',
      passwordHash: adminHash,
      role: 'admin',
      delegacion: 'CENTRAL',
    },
  })

  await prisma.user.create({
    data: {
      username: 'usuario1',
      passwordHash: userHash,
      role: 'user',
      delegacion: 'ROSARIO',
    },
  })

  console.log('✅ Usuarios creados:')
  console.log('   → admin / admin123  (Administrador)')
  console.log('   → usuario1 / user123  (Usuario - ROSARIO)')
}

main()
  .catch(e => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
