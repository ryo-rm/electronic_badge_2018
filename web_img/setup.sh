#!/bin/bash -ue

function install_node () {
  typeset -r TARGET="node-v11.15.0-linux-armv6l"
  wget "https://nodejs.org/dist/v11.15.0/${TARGET}.tar.gz"
  tar xf "${TARGET}.tar.gz"

  pushd ${TARGET} > /dev/null

  echo "install.."
  rm -rf CHANGELOG.md LICENSE README.md
  sudo cp -r * /usr/local/

  popd > /dev/null

  rm -rf ${TARGET}
  rm -f "${TARGET}.tar.gz"

  echo "success!"
}

function user_input () {
  echo -n "y/n"
  read input
  if [ -z ${input} ]; then
    user_input
  elif [ ${input} = "n" ]; then
    echo "exit.."
    exit 1
  elif [ ${input} = "y" ]; then
    echo ""
  else
    user_input
  fi
}

# install node
if !(type "node" > /dev/null 2>&1); then
  echo -n "install nodejs ? "
  user_input
  install_node
fi

# install chrome
sudo apt install chromium-browser -y

# install dependencies
npm ci

echo "setup success!"

