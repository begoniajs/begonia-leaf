/**
 * @description Store类
 * 每个redux应用都只包含一个Store实例和一个reducer
 */
declare class Store {
  /**
   * @public
   * @description 构造函数
   * @param reducer {function} [required] 全局reducer函数
   * @param state {object} [required] 全局state对象
   */
  constructor(reducer: () => void, state: object)
  /**
   * @public
   * @description 派发一个action
   * @param type {string} [required]  action类型
   * @param data {object} [optional]  action数据
   */
  dispatch(type: string, payload?: object): void
  /**
   * @public
   * @description 返回store中的state对象或state树
   */
  state: object;
  /**
   * @public
   * @description 返回根级state
   */
  rootState:object;
  /**
   * @public
   * @description 订阅state变化
   *
   * @param listener {Function} [required] 监听变化的回调函数
   *
   * @return {Function} 取消订阅的方法
   */
  subscribe(listener: () => void): () => void
}
/**
 * @public
 *
 * @description 将需要的action析出
 *
 * @param {object[]} list [required] 需要的action函数名称集合
 * @return {object} 由选择的action组成的集合
 */
export function mapActions(list: object[]): object;
/**
 * @public
 * @description 将需要的getter析出
 * @param { object | Array<Object|String> } list [required]
 * @param {boolan} getValueNow [optional] 析出的属性是否全部要获取初始值，默认为true
 * @returns {object | Array<Object|String>}
 */
export function mapGetters(list: object | Array<object | string>, getValueNow?: boolean): object | Array<object | string>;

/**
 * @description begoina redux-lite (bex) 提供bex的入口和基本功能
 * @version 1.0.0
 * @author Brave Chan on 2019.5
 */
export namespace bex {
  /**
   * @public
   * @description 创建一个store实例
   * 注意当一个store实例创建时，将会成为单例。
   * 如果下次再调用该方法，仍然会返回上一次创建的实例。
   *
   * @param {object} opt [required] store的配置对象
   *
   * @return {object}
   */
  export function createStore(opt: object): Store;
  /**
   * @public
   * @description 开启/关闭 debug模式
   */
  export let debug: boolean;
  /**
   * @public
   * @description 系统创建的唯一store
   */
  export const store: Store;
  /**
   * @public
   * @description 可以通过getters访问state上设置getter的属性
   */
  export const getters: object;
  /**
   * @public
   * @description 可以通过actions访问定义的action函数
   */
  export const actions: object;
}
