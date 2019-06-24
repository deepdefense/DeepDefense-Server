#!/bin/bash
echo 'start daemon'
if [ ! $1 ] || [ ! $2 ] || [ ! -e $1 ]; then
  exit
fi

function createMd5file()
{
  md5sum -b $1 > $2
}

if [ ! -e $2 ]; then
 createMd5file $1 $2
fi

while (true) ; do
  md5sum -c $2 --status
  if [ $? -gt 0 ]; then
    echo 123

    sudo docker ps | grep deepdefense-monitor | awk '{print $1}' |xargs -i sudo docker restart {}
    createMd5file $1 $2
  fi
  sleep 3
done
