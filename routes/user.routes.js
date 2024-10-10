const express = require('express');
const router = express.Router();
const User = require('../models/User');


router.get('/users', async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 100;
  const sortByDate = req.query.sortByDate || 'latest';
  const searchQuery = req.query.search || '';
  const sortByActivity = req.query.sortByActivity === 'true';
  const filterByRole = req.query.filterByRole || '';
  const filterByFilial = req.query.filterByFilial || ''; // Новый фильтр по филиалу

  try {
    const startIndex = (page - 1) * limit;
    let query = {};

    if (searchQuery) {
      const parsedQuery = parseInt(searchQuery);
      if (!isNaN(parsedQuery)) {
        query.phone = parsedQuery;
      } else {
        query.$or = [
          { name: { $regex: new RegExp(searchQuery, 'i') } },
          { surname: { $regex: new RegExp(searchQuery, 'i') } }
        ];
      }
    }

    if (filterByRole) {
      query.role = filterByRole;
    }

    if (filterByFilial) {
      query.selectedFilial = filterByFilial; // Фильтрация по филиалу
    }

    let sortOptions = {};
    if (sortByDate === 'latest') {
      sortOptions.createdAt = -1; // Убрал строку и изменил на -1 для правильной сортировки
    } else if (sortByDate === 'oldest') {
      sortOptions.createdAt = 1; // Убрал строку и изменил на 1 для правильной сортировки
    }

    const users = await User.find(query)
      .sort(sortOptions)
      .limit(limit)
      .skip(startIndex)
      .lean();

    const usersWithCounts = users.map(user => ({
      ...user,
      bookmarkCount: (user.bookmarks || []).length,
      archiveCount: (user.archive || []).length,
      totalActivity: (user.bookmarks || []).length + (user.archive || []).length
    }));

    if (sortByActivity) {
      usersWithCounts.sort((a, b) => b.totalActivity - a.totalActivity);
    }

    const totalCount = await User.countDocuments(query);

    res.json({
      totalCount,
      currentPage: page,
      totalPages: Math.ceil(totalCount / limit),
      users: usersWithCounts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});


module.exports = router;
