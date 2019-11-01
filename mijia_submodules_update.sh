
# 初始化并更新 submodules
git submodule update --init --recursive

# 把 submodules checkout 到 master (默认是游离的commit)(暂时不做)
# git submodule foreach -q --recursive 'git checkout $(git config -f $toplevel/.gitmodules submodule.$name.branch || echo master)'