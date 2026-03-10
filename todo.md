এবার `package.json` খুলে কয়েকটা script যোগ করি, যাতে build করার সময় দ্রুত কাজ করা যায়।

আমরা এখন scripts এর মধ্যে dev, build ও সেই সাথে test এর জন্য কমান্ড গুলো লিখে দিচ্ছি।

"dev" : "tsx src/cli.ts" আমরা মূলত একটু পরেই src ফোল্ডার বানাবো সেখানে cli.ts এর মধ্যে কাজ গুলো করবো ঠিক আছে। 

একই ভাবে আমি 

```json
{
    "scripts": {
        "dev": "tsx src/cli.ts",
        "build": "tsup src/cli.ts src/github.ts --format esm,cjs --dts",
        "test": "vitest run"
    }
}
```

আর আমি project-এ Node 24-ও set করতে চাই, যাতে runtime modern baseline-এর সাথে consistent থাকে।

```json
{
    "engines": {
        "node": ">=24"
    }
}
```
----