
export interface ArcweaveProject {
  startingElement: string
  boards: {[id: string]: Board}
  notes: {[id: string]: Note}
  elements: {[id: string]: Element}
  jumpers: {[id: string]: Jumper}
  connections: {[id: string]: Connection}
  branches: {[id: string]: Branch}
  components: {[id: string]: Component}
  attributes: {[id: string]: Attribute}
  assets: {[id: string]: Asset}
  variables: {[id: string]: Variable}
  conditions: {[id: string]: Condition}
  name: string
  cover: Cover
}

export type Cover = {
  file: string
  type: string
}

export type BoardItem = {
  name: string
  notes: string[]
  jumpers: string[]
  branches: string[]
  elements: string[]
  connections: string[]
}

export type BoardFolder = {
  root?: boolean
  name?: string
  children: string[]
}

export type Board = BoardFolder | BoardItem

export type Note = {
  theme: string
  content: string
  autoHeight: boolean
}

export type Element = {
  theme: string
  title: string
  content: string
  outputs: string[]
  autoHeight: boolean
  components: string[]
}

export type Connection = {
  type: string
  label: string|null
  theme: string
  sourceid: string
  targetid: string
  sourceType: 'elements'|'conditions'|string
  targetType: 'elements'|'jumpers'|'branches'|string
}

export type Branch = {
  theme: string
  conditions: {
    ifCondition: string,
    elseIfConditions?: string[]
    elseCondition?: string
  }
}

export type Component = {
  name: string
  children?: string[]
  assets?: {
    cover: {
      id: string
    } | {
      file: string
      type: string
    }
  }
  attributes?: string[]
}

export type Jumper = {
  elementId: string
}

export type VariableItem = {
  name: string
  type: string
  value: boolean|string|number|null
}

export type VariableFolder = {
  root: boolean
  children: string[]
}

export type Variable = VariableFolder | VariableItem

export type Condition = {
  output: string
  script: string|null
}

export type Attribute = {
  cId: string
  name: string
  cType: 'elements'|'components'|string
  value: {
    data: string
    type: string
    plain?: boolean
  }
}

export type AssetItem = {
  name: string
  type: string
}

export type AssetFolder = {
  root: boolean
  children: string[]
}

export type Asset = AssetItem | AssetFolder