//if you want to run type npm run seed

const mongoose = require('mongoose');
const { User, Book } = require('./schema.js');
mongoose.connect('***') //put your own mongoose driver here!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
.then(() => {
  console.log(' MongoDB connected successfully');
  runTest();
})
.catch(error => {
  console.log(' Failed to connect to MongoDB: ', error);
});

async function runTest() {
  try {
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
    
  } catch (error) {
    console.log('Error: ', error.message);
  }
}
