import mongoose from 'mongoose';
import dotenv from 'dotenv';
import FinanceLesson from './src/models/FinanceLesson.js';

dotenv.config();

const lessons = [
  {
    id: 1,
    title: "সঞ্চয় (Savings)",
    desc: "ভবিষ্যতের নিরাপত্তার জন্য অর্থ জমানো।",
    icon: "fa-piggy-bank",
    color: "emerald",
    content: {
      intro: "আজ খরচ না করে ভবিষ্যতের জন্য রেখে দেওয়া অর্থই সঞ্চয়।",
      importance: ["জরুরি খরচ সামলাতে", "ভবিষ্যতের লক্ষ্য পূরণে", "আর্থিক চাপ কমাতে"],
      example: "৪০ টাকা প্রতিদিন সঞ্চয় → মাসে ১,২০০ টাকা।"
    },
    quiz: [
      { q: "সঞ্চয় মানে কী?", options: ["খরচ করা", "রেখে দেওয়া", "ধার নেওয়া"], answer: 1 },
      { q: "প্রতিদিন ৪০ টাকা সঞ্চয় করলে ৩০ দিনে কত হবে?", options: ["৪০০", "১,২০০", "২০০"], answer: 1 },
      { q: "সঞ্চয় কেন দরকার?", options: ["ফ্যাশন", "ভবিষ্যতের নিরাপত্তা", "সময় কাটানো"], answer: 1 }
    ]
  },
  {
    id: 2,
    title: "সুদ (Interest)",
    desc: "টাকার ওপর পাওয়া বাড়তি আয়।",
    icon: "fa-percent",
    color: "blue",
    content: {
      intro: "ব্যাংকে জমা রাখা টাকার ওপর পাওয়া বাড়তি অর্থ।",
      types: ["Simple Interest (সরল)", "Compound Interest (চক্রবৃদ্ধি—সবচেয়ে লাভজনক)"],
      example: "১০% সুদে ৫০০০ টাকায় ১ বছর → ৫০০ টাকা সুদ।"
    },
    quiz: [
      { q: "সুদ কী?", options: ["জরিমানা", "বাড়তি টাকা", "খরচ"], answer: 1 },
      { q: "কোনটা বেশি লাভজনক?", options: ["সরল সুদ", "চক্রবৃদ্ধি সুদ"], answer: 1 },
      { q: "১০% সুদে ১০০০ টাকায় ১ বছর →?", options: ["১০০", "১০", "১,০০০"], answer: 0 }
    ]
  },
  {
    id: 3,
    title: "মুদ্রাস্ফীতি (Inflation)",
    desc: "কেন জিনিসের দাম বাড়ে?",
    icon: "fa-arrow-trend-up",
    color: "red",
    content: {
      intro: "সময় বাড়ার সাথে জিনিসপত্রের দামের বৃদ্ধি।",
      importance: ["কারণ টাকা দিয়ে কম জিনিস কেনা যায়।"],
      example: "২০২০ সালে চাল ৫০ টাকা/কেজি → এখন ৭০–৮০ টাকা।"
    },
    quiz: [
      { q: "মুদ্রাস্ফীতি মানে?", options: ["দাম বাড়া", "দাম কমা", "কিছুই না"], answer: 0 },
      { q: "মুদ্রাস্ফীতি হলে?", options: ["বেশি জিনিস কেনা যায়", "কম জিনিস কেনা যায়", "একই"], answer: 1 },
      { q: "ইনফ্লেশন হারাতে কী দরকার?", options: ["বিনিয়োগ", "ঘুম", "নতুন ফোন"], answer: 0 }
    ]
  },
  {
    id: 4,
    title: "বাজেটিং (৫০/৩০/২০)",
    desc: "টাকা জমানোর সেরা নিয়ম।",
    icon: "fa-scale-balanced",
    color: "purple",
    content: {
      intro: "আগে থেকেই আয়ের সাথে মিলিয়ে খরচ পরিকল্পনা করা।",
      rules: ["৫০% — প্রয়োজন (খাবার, ভাড়া)", "৩০% — ইচ্ছা (শখ, পোশাক)", "২০% — সঞ্চয় ও বিনিয়োগ"],
      example: "৩০,০০০ টাকা আয় → ১৫k প্রয়োজন + ৯k ইচ্ছা + ৬k সঞ্চয়।"
    },
    quiz: [
      { q: "বাজেটিং কেন গুরুত্বপূর্ণ?", options: ["খরচ নিয়ন্ত্রণ", "সময় কাটানো", "ফ্যাশন"], answer: 0 },
      { q: "৫০/৩০/২০ তে ২০% যায় কোথায়?", options: ["ইচ্ছা", "সঞ্চয়/ইনভেস্ট", "গেমস"], answer: 1 },
      { q: "৩০k আয়ে ২০% কত?", options: ["৬k", "৭k", "৩k"], answer: 0 }
    ]
  },
  {
    id: 5,
    title: "ব্যাংক অ্যাকাউন্টের ধরন",
    desc: "কোথায় টাকা রাখবেন?",
    icon: "fa-building-columns",
    color: "indigo",
    content: {
      intro: "আপনার প্রয়োজন অনুযায়ী সঠিক অ্যাকাউন্ট বেছে নিন।",
      types: ["Savings: সুদ পাওয়া যায়, সঞ্চয়ের জন্য।", "Current: ব্যবসায়ীদের জন্য, সুদ নেই।", "Fixed Deposit (FD): নির্দিষ্ট সময়ের জন্য, বেশি সুদ।"]
    },
    quiz: [
      { q: "Savings Account কেন?", options: ["খেলা", "সঞ্চয় ও সুদ", "ঋণ"], answer: 1 },
      { q: "Current Account কার জন্য?", options: ["ব্যবসায়ীদের", "শিশুদের", "ডাক্তারদের"], answer: 0 },
      { q: "সর্বোচ্চ সুদ কোথায়?", options: ["FD", "Current", "ঋণ"], answer: 0 }
    ]
  },
  {
    id: 6,
    title: "বিনিয়োগ (Investment)",
    desc: "টাকা দিয়ে টাকা বানানো।",
    icon: "fa-seedling",
    color: "green",
    content: {
      intro: "টাকা এমন জায়গায় রাখা যেখানে সময়ের সাথে মূল্য বাড়বে।",
      methods: ["শেয়ার", "মিউচুয়াল ফান্ড", "সঞ্চয়পত্র", "সোনা", "ব্যবসা"],
      principle: "কম ঝুঁকি = কম মুনাফা | বেশি ঝুঁকি = বেশি মুনাফা"
    },
    quiz: [
      { q: "বিনিয়োগের লক্ষ্য?", options: ["খরচ বাড়ানো", "টাকা বৃদ্ধি", "সময় নষ্ট"], answer: 1 },
      { q: "সবচেয়ে কম ঝুঁকি কোনটিতে?", options: ["সঞ্চয়পত্র", "শেয়ার"], answer: 0 },
      { q: "বিনিয়োগ মানে?", options: ["হুট করে কেনা", "ভবিষ্যতের জন্য টাকা বাড়ানো"], answer: 1 }
    ]
  },
  {
    id: 7,
    title: "ডিজিটাল লেনদেন",
    desc: "নিরাপদ অনলাইন পেমেন্ট।",
    icon: "fa-mobile-screen",
    color: "teal",
    content: {
      intro: "bKash, Nagad, Rocket বা কার্ড ব্যবহারের সময় সতর্কতা।",
      rules: ["PIN কাউকে বলবেন না", "অপরিচিত লিঙ্কে ক্লিক করবেন না", "অজানা মেসেজ বিশ্বাস করবেন না"]
    },
    quiz: [
      { q: "PIN কাকে বলা যাবে?", options: ["কাউকে না", "বন্ধুকে", "দোকানদার"], answer: 0 },
      { q: "প্রতারণা রোধে কী করবেন?", options: ["লিঙ্ক খুলবেন", "লেনদেন যাচাই করবেন"], answer: 1 },
      { q: "ডিজিটাল লেনদেন কী?", options: ["নগদ", "মোবাইল/অনলাইন"], answer: 1 }
    ]
  },
  {
    id: 8,
    title: "স্ক্যাম থেকে বাঁচুন",
    desc: "প্রতারণা চেনার উপায়।",
    icon: "fa-shield-halved",
    color: "orange",
    content: {
      intro: "অনলাইনে নানা ধরণের ফাঁদ থাকে।",
      scams: ["'লটারি জিতেছেন!' মেসেজ", "ভুয়া কাস্টমার কেয়ার", "অবিশ্বাস্য কম দাম"],
      prevention: "আগে যাচাই, তারপর লেনদেন। ব্যক্তিগত তথ্য গোপন রাখুন।"
    },
    quiz: [
      { q: "কোনটি স্ক্যাম হতে পারে?", options: ["লটারি জিতেছেন SMS", "ব্যাংকের কল"], answer: 0 },
      { q: "স্ক্যাম থেকে বাঁচতে?", options: ["যাচাই করবেন", "তাড়াহুড়া"], answer: 0 },
      { q: "ব্যক্তিগত তথ্য?", options: ["সবাইকে দিন", "গোপন রাখুন"], answer: 1 }
    ]
  }
];

const seedDB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected!');

    console.log('Clearing old lessons...');
    await FinanceLesson.deleteMany({});
    
    console.log('Seeding new lessons...');
    await FinanceLesson.insertMany(lessons);
    
    console.log('Lessons seeded successfully!');
    mongoose.connection.close();
  } catch (err) {
    console.error('Error seeding DB:', err);
    process.exit(1);
  }
};

seedDB();
