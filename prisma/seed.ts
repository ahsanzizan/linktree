import { PrismaClient } from '@prisma/client';
import { linksSeeder } from '../src/lib/seeders/links';

const prisma = new PrismaClient();

async function main() {
	console.log('Started seeding...');

	for (const l of linksSeeder) {
		const link = await prisma.link.create({ data: l });
		console.log(`Created link with id: ${link.id}`);
	}
	console.log('Finished seeding');
}

main()
	.then(async () => await prisma.$disconnect())
	.catch(async (e) => {
		console.error(e);
		await prisma.$disconnect();
	});
