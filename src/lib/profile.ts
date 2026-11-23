export type Link = {
	id: string;
	title: string;
	url: string;
};

export const profile = {
	username: 'ahsanzizan',
	fullName: 'Ahsan Awadullah Azizan',
	bio: 'Software engineer at Genesis Holdings. I conceptualize, design, implement, and ship.',
	picture: '/avatar.webp',
	pictureSource: 'https://avatars.githubusercontent.com/u/116133300?v=4'
};

export const links: Link[] = [
	{ id: '6610d1359fbc8bad9a6e3817', title: 'Personal Website', url: 'https://www.ahsanzizan.xyz' },
	{ id: '6610c06b9fbc8bad9a6e3812', title: 'Instagram', url: 'https://instagram.com/ahsanzizan' },
	{
		id: '661219588ff6d388d609974a',
		title: 'YouTube Channel',
		url: 'https://youtube.com/@ahsanzizan'
	},
	{
		id: '6610d02a9fbc8bad9a6e3815',
		title: 'Discord',
		url: 'https://discordapp.com/users/650696568227233823'
	},
	{ id: '6610d0459fbc8bad9a6e3816', title: 'Work Email', url: 'mailto:contact@ahsanzizan.xyz' },
	{ id: '6610ceb09fbc8bad9a6e3814', title: 'GitHub', url: 'https://github.com/ahsanzizan' },
	{
		id: '6610cea69fbc8bad9a6e3813',
		title: 'LinkedIn',
		url: 'https://linkedin.com/in/ahsan-azizan'
	},
	{
		id: '6610df889fbc8bad9a6e3821',
		title: 'Google Developers Profile',
		url: 'https://g.dev/ahsanzizan'
	},
	{
		id: '6610dfd99fbc8bad9a6e3822',
		title: 'HackerRank',
		url: 'https://www.hackerrank.com/profile/ahsanzizan'
	},
	{ id: '6610e0119fbc8bad9a6e3823', title: 'X', url: 'https://twitter.com/ahsanaz461' }
];
