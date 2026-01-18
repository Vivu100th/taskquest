"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt = __importStar(require("bcrypt"));
const prisma = new client_1.PrismaClient();
async function main() {
    console.log('🌱 Seeding database...');
    const categories = await Promise.all([
        prisma.category.upsert({
            where: { id: 'cat-health' },
            update: {},
            create: { id: 'cat-health', name: 'Health & Fitness' },
        }),
        prisma.category.upsert({
            where: { id: 'cat-learning' },
            update: {},
            create: { id: 'cat-learning', name: 'Learning' },
        }),
        prisma.category.upsert({
            where: { id: 'cat-productivity' },
            update: {},
            create: { id: 'cat-productivity', name: 'Productivity' },
        }),
        prisma.category.upsert({
            where: { id: 'cat-social' },
            update: {},
            create: { id: 'cat-social', name: 'Social' },
        }),
    ]);
    console.log('✅ Created categories:', categories.map(c => c.name));
    const tasks = await Promise.all([
        prisma.task.upsert({
            where: { id: 'task-1' },
            update: {},
            create: {
                id: 'task-1',
                title: 'Morning Workout',
                description: 'Complete a 30-minute workout session',
                categoryId: 'cat-health',
                difficulty: 'MEDIUM',
                basePoints: 50,
                requiresPhoto: true,
            },
        }),
        prisma.task.upsert({
            where: { id: 'task-2' },
            update: {},
            create: {
                id: 'task-2',
                title: 'Read 20 Pages',
                description: 'Read at least 20 pages of a book',
                categoryId: 'cat-learning',
                difficulty: 'EASY',
                basePoints: 30,
                requiresPhoto: true,
            },
        }),
        prisma.task.upsert({
            where: { id: 'task-3' },
            update: {},
            create: {
                id: 'task-3',
                title: 'Complete a Side Project Feature',
                description: 'Implement and deploy one feature of your side project',
                categoryId: 'cat-productivity',
                difficulty: 'HARD',
                basePoints: 100,
                requiresPhoto: true,
            },
        }),
        prisma.task.upsert({
            where: { id: 'task-4' },
            update: {},
            create: {
                id: 'task-4',
                title: 'Run 5km',
                description: 'Complete a 5km run outdoors',
                categoryId: 'cat-health',
                difficulty: 'HARD',
                basePoints: 80,
                requiresPhoto: true,
                requiresGps: true,
            },
        }),
        prisma.task.upsert({
            where: { id: 'task-5' },
            update: {},
            create: {
                id: 'task-5',
                title: 'Learn 10 New Words',
                description: 'Learn 10 new vocabulary words in a foreign language',
                categoryId: 'cat-learning',
                difficulty: 'EASY',
                basePoints: 25,
                requiresPhoto: true,
            },
        }),
    ]);
    console.log('✅ Created tasks:', tasks.map(t => t.title));
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await prisma.user.upsert({
        where: { email: 'admin@taskquest.com' },
        update: {},
        create: {
            email: 'admin@taskquest.com',
            username: 'admin',
            password: adminPassword,
            role: 'ADMIN',
            totalPoints: 0,
            currentRank: 'MASTER',
        },
    });
    console.log('✅ Created admin user:', admin.email);
    console.log('   Password: admin123');
    console.log('\n🎉 Seeding complete!');
}
main()
    .catch((e) => {
    console.error(e);
    process.exit(1);
})
    .finally(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=seed.js.map