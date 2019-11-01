# 添加 Mijia-CommonUI-Modules 模块
git submodule add https://github.com/lumigit/Mijia-CommonUI-Modules.git Modules/Mijia-CommonUI-Modules &&
# 添加 Mijia-CommonFunction-Modules 模块
git submodule add https://github.com/lumigit/Mijia-CommonFunction-Modules.git Modules/Mijia-CommonFunction-Modules &&
# 初始化并更新 submodules
git submodule update --init --recursive &&
# 初始化项目的 package.json
node ./Modules/Mijia-CommonFunction-Modules/DevTools/initPackage.js &&
# 删除旧依赖
rm -rf ./node_modules && rm -f package-lock.json &&
# 安装依赖
npm install