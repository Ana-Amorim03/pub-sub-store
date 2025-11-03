const RabbitMQService = require('./rabbitmq-service')
const path = require('path')

require('dotenv').config({ path: path.resolve(__dirname, '.env') })

var report = {}
async function updateReport(products) {
    for(let product of products) {
        if(!product.name) {
            continue
        } else if(!report[product.name]) {
            report[product.name] = 1;
        } else {
            report[product.name]++;
        }
    }

}

async function printReport() {
    for (const [key, value] of Object.entries(report)) {
        console.log(`${key} = ${value} sales`);
      }
}

async function consume() {
    const reportQueue = 'report'
    try {
        const rabbitMQInstance = await RabbitMQService.getInstance()
        
        await rabbitMQInstance.consume(reportQueue, async (msg) => {
            const orderData = JSON.parse(msg.content)
            if (orderData.products) {
                await updateReport(orderData.products)
                console.log('\n====== Current Sales Report ======')
                await printReport()
                console.log('================================\n')
            }
        })

        console.log('Report service is running...')
    } catch (error) {
        console.error('Error:', error)
    }
} 

consume()
