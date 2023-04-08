const DUMMY_MENU_LIST = [
    {
      id: 'dashboard',
      title: 'Dashboard',
      url: '/',
    },
    {
      id: 7,
      title: 'Master User',
      url: '/master/user',
    },
    {
      id: 15,
      title: 'Master Menu',
      url: '/master/menu',
    },
    {
      id: 16,
      title: 'Master News',
      url: '/master/news',
    },
    {
      id: 21,
      title: 'Master PPOB',
      url: '/master/ppob',
      children: [
        {
          id: 5,
          title: 'Product Category',
          url: '/master/ppob/product-category',
          children: [],
        },
        {
          id: 6,
          title: 'Product Group',
          url: '/master/ppob/product-group',
          children: [
              {
                id: 8,
                title: 'Sub Product Group',
                url: '/master/ppob/product-group/sub-product-group',
              },
          ],
        },
      ],
    },
];
  
const CURRENT_DATE = new Date();

export { CURRENT_DATE, DUMMY_MENU_LIST };

