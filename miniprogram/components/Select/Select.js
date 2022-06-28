Component({
    properties: {
        // 选项
        options: {
            type: Array,
            value: []
        },
        // 默认选项
        defaultOption: {
            type: Object,
            value: {
                // id: '0',
                // name: '请选择'
            }
        },
        // properties中的 key 和 text 是为了做属性名转换
        key: {
            type: String,
            value: 'id'
        },
        text: {
            type: String,
            value: 'name'
        }
    },
    data: {
        result: [],
        isShow: false,
        current: {}
    },
    methods: {
        // 显示或隐藏列表
        openClose() {
            this.setData({
                isShow: !this.data.isShow
            })
        },
        // 选择option
        optionTap(e) {
            let dataset = e.target.dataset
            this.setData({
                current: dataset,
                isShow: false
            });

            // 调用父组件方法，并传参
            this.triggerEvent("change", {
                ...dataset
            })
        },
        // 此方法供父组件调用
        close() {
            this.setData({
                isShow: false
            })
        }
    },
    lifetimes: {
        attached() {
            // 属性名称转换, 如果不是 { id: '', name:'' } 格式，则转为 { id: '', name:'' } 格式
            let result = []
            if (this.data.key !== 'id' || this.data.text !== 'name') {
                for (let item of this.data.options) {
                    let {
                        [this.data.key]: id, [this.data.text]: name
                    } = item
                    result.push({
                        id,
                        name
                    })
                }
            }

            this.setData({
                current: Object.assign({
                    id: '0',
                    name: '请选择'
                }, this.data.defaultOption),
                result: result
            })
        }
    }
})