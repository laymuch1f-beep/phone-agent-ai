"use strict";
Object.defineProperty(exports, "__esModule", {
    value: true
});
Object.defineProperty(exports, "PhoneModule", {
    enumerable: true,
    get: function() {
        return PhoneModule;
    }
});
const _common = require("@nestjs/common");
const _phoneservice = require("./phone.service");
const _aimodule = require("../ai/ai.module");
const _searchmodule = require("../search/search.module");
const _domainmodule = require("../domain/domain.module");
const _voicemodule = require("../voice/voice.module");
function _ts_decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
let PhoneModule = class PhoneModule {
};
PhoneModule = _ts_decorate([
    (0, _common.Module)({
        imports: [
            _aimodule.AIModule,
            _searchmodule.SearchModule,
            _domainmodule.DomainModule,
            _voicemodule.VoiceModule
        ],
        exports: [
            _phoneservice.PhoneService
        ],
        providers: [
            _phoneservice.PhoneService
        ]
    })
], PhoneModule);

//# sourceMappingURL=phone.module.js.map