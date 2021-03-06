/**
 * Timer decorator for measuring the performance of class method calls
 *
 * @format
 */
import now from 'performance-now'

export default function debog(...params: [number | string, ...string[]]) {
  const asyncRegexp = /^\*/
  const checkThreshold = typeof params[0] === 'number'
  let threshold = 0
  if (checkThreshold) {
    threshold = params.unshift()
  }

  return function TimerFactory<T extends { new (...args: any[]): {} }>(Target: T) {
    return class Timed extends Target {
      constructor(...args: any[]) {
        super(...args)

        for (let param of params) {
          const method = param as string
          const promise = asyncRegexp.test(method)
          const methodName = !promise ? method : method.replace(asyncRegexp, '')
          this[methodName] = !promise
            ? this.__time(this[methodName], methodName)
            : this.__asyncTime(this[methodName], methodName)
        }
      }

      __time = (method: Function, name: string) => (...args: any[]) => {
        const s = now()
        const result = method(...args)
        const t = now() - s
        if (t >= threshold) {
          console.log('%c%s took %fms', 'color: red', name, t)
        }
        return result
      }

      __asyncTime = (method: Function, name: string) => async (...args: any[]) => {
        const s = now()
        const result = await method(...args)
        const t = now() - s
        if (t >= threshold) {
          console.log('%c%s took %fms', 'color: red', name, t)
        }
        return result
      }
    }
  }
}
