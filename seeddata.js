// if you want to run type npm run seed
require('dotenv').config(); // 加载 .env 环境变量
const mongoose = require('mongoose');
// 修复路径：schema.js 在 models 文件夹下
const { User, Book, Item } = require('./models/schema');

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log(' MongoDB connected successfully');
  runTest();
})
.catch(error => {
  console.log(' Failed to connect to MongoDB: ', error);
  process.exit(1);
});

async function runTest() {
  try {
    //Clear data, avoid repetition
    await User.deleteMany({});
    await Book.deleteMany({});
    await Item.deleteMany({});
    console.log('✅ Old collections cleared');

    const stu1 = new User({
      username: "s0000001",
      password: "sz212345",
      name: "Zhang San"
    });
    await stu1.save();
    console.log(`user:${stu1.name} saved`);
    
    const stu2 = new User({
      username: "s1397832",
      password: "Abc22222",
      name: "Xiao Ming"
    });
    await stu2.save();
    console.log(`user:${stu2.name} saved`);
    
    const stu3 = new User({
      username: "s3780234",
      password: "Def33333",
      name: "Xiao Qiao"
    });
    await stu3.save();
    console.log(`user:${stu3.name} saved`);
    
    const book1 = new Book({
      title: "Computer networks. 1",
      author: "Kurose, James F. ; Ross, Keith W.",
      category: "Computer Networks",
      publisher: "Pearson Education Asia Limited",
      publishYear: 2022
    });
    await book1.save();
    console.log(`book:${book1.title} saved`);

    const book2 = new Book({
      title: "Computer networks. 2",
      author: "Kurose, James F. ; Ross, Keith W.",
      category: "Computer Networks",
      publisher: "Pearson Education Asia Limited",
      publishYear: 2022
    });
    await book2.save();
    console.log(`book:${book2.title} saved`);

    const book3 = new Book({
      title: "Computer networks. 3",
      author: "Kurose, James F. ; Ross, Keith W.",
      category: "Computer Networks",
      publisher: "Pearson Education Asia Limited",
      publishYear: 2022
    });
    await book3.save();
    console.log(`book:${book3.title} saved`);

    // One deterministic item for the RESTful curl tests. Its `version` is the
    // stable key used in README.md instead of a machine-generated MongoDB _id,
    // so every machine / Ubuntu VM testing the API sees the same value.
    const item1 = new Item({
      name: 'Sample Task',
      completed: false,
      version: 'v1'
    });
    await item1.save();
    console.log(`item:${item1.name} (version ${item1.version}) saved`);

    console.log('\n🎉 All seed data inserted!');
  } catch (error) {
    console.log('Error: ', error.message);
  } finally {
  
    await mongoose.disconnect();
    console.log('🔌 MongoDB connection closed');
  }
}
