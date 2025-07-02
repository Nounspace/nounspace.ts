// WalletConnect packages import these classes at runtime even though they are
// primarily used for typing. Define no-op class stubs to satisfy the imports
// without pulling in the real implementations which depend on Node APIs.
export class IMessageTracker {}
export class IPublisher {}
export class ISubscriber {}
export class IRelayer {}
export class IStore {}
export class IJsonRpcHistory {}
export class IExpirer {}
export class IVerify {}
export class IEchoClient {}
export class IEventClient {}
export class ICore {}
export class ISignClient {}
export class IEngine {}
export default {};
