"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
const _core = require("@nestjs/core");
const _appmodule = require("./app.module");
async function bootstrap() {
    console.log('🚀 Starting Phone Agent application...');
    const app = await _core.NestFactory.create(_appmodule.AppModule, {
        rawBody: true
    });
    const port = process.env.PORT || 8080;
    await app.listen(port, '0.0.0.0');
    console.log(`✅ Application running on port: ${port}`);
    console.log(`🌐 Health: http://0.0.0.0:${port}/`);
}
bootstrap();

//# sourceMappingURL=main.js.map