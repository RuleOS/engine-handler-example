interface StackData<T> {
  [index: number]: T;
}

export class Stack<T> {
  private items: StackData<T> = {}
  private count: number = 0

  push (ele: T) {
    this.items[this.count++] = ele
  }

  peek () {
    return this.items[this.count - 1]
  }

  pop () {
    if (this.isEmpty()) return
    const result = this.items[--this.count]
    delete this.items[this.count]
    return result
  }

  isEmpty () {
    return this.count === 0
  }

  size () {
    return this.count
  }

  clear () {
    this.items = {}
    this.count = 0
  }

  toString () {
    if (this.isEmpty()) return ''
    let objString = `${this.items[0]}`
    for (let i = 1; i < this.count; i++) {
      objString += ` ${this.items[i]}`
    }
    return objString
  }
}
