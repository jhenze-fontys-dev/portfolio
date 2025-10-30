// backend/data/sql/models/template.relations.js
// -----------------------------------------------------------------------------
// 🧩 TEMPLATE SEQUELIZE RELATIONS
// This file demonstrates how to define associations (relations) between models.
// You can copy this when creating relational models like User ↔ Post, etc.
// -----------------------------------------------------------------------------

import User from './user.model.js';
import Post from './post.model.js';
import Comment from './comment.model.js';

// Example 1️⃣: One-to-Many (User → Posts)
User.hasMany(Post, {
  foreignKey: 'userId',     // foreign key in the Post table
  as: 'posts',              // alias for eager loading (user.getPosts())
});

Post.belongsTo(User, {
  foreignKey: 'userId',
  as: 'user',
});

// Example 2️⃣: One-to-Many (Post → Comments)
Post.hasMany(Comment, {
  foreignKey: 'postId',
  as: 'comments',
});

Comment.belongsTo(Post, {
  foreignKey: 'postId',
  as: 'post',
});

// Example 3️⃣: Optional Many-to-Many (Users ↔ Roles)
// (Requires a through table like UserRoles)
import Role from './role.model.js';
User.belongsToMany(Role, {
  through: 'UserRoles',     // join table name
  foreignKey: 'userId',
  otherKey: 'roleId',
  as: 'roles',
});

Role.belongsToMany(User, {
  through: 'UserRoles',
  foreignKey: 'roleId',
  otherKey: 'userId',
  as: 'users',
});

// ✅ Export all models to make importing easy elsewhere
export { User, Post, Comment, Role };
