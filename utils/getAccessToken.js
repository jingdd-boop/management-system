const rp = require('request-promise')
const APPSECRET= '8696700944b7c2f951c9f6b1eb898869'
const APPID =  'wx4894000f8897b589'
const URL = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${APPID}&secret=${APPSECRET}`

const fs = require('fs')//node自带
const path = require('path')
const { create } = require('domain')
const fileName = path.resolve(__dirname,'./access_token.json')
//console.log(fileName)

const updateAccessToken = async () => {
  const resStr = await rp(URL)
  const res = JSON.parse(resStr)
  console.log(res)
  // 写文件
  if (res.access_token) {
      fs.writeFileSync(fileName, JSON.stringify({
          access_token: res.access_token,
          createTime: new Date()
      }))
  } else {
      await updateAccessToken()
  }
}

const getAccessToken = async () => {
  // 读取文件
  try {
      const readRes = fs.readFileSync(fileName, 'utf8')
      const readObj = JSON.parse(readRes)
      const createTime = new Date(readObj.createTime).getTime()
      const nowTime = new Date().getTime()
      if ((nowTime - createTime) / 1000 / 60 / 60 >= 2) {
          await updateAccessToken()
          await getAccessToken()
      }
      return readObj.access_token
  } catch (error) {
      await updateAccessToken()
      await getAccessToken()
  }
}

setInterval(async () => {
  await updateAccessToken()
}, (7200 - 300) * 1000)

// updateAccessToken()
// console.log(getAccessToken())
module.exports = getAccessToken
