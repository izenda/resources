// Require jQuery - jq$
// Using:
// IzLocal.LocalizePage();
var IzLocal =
{
    CurrentLanguage: "en-US",
    
    availableAttributes: [
        'lang-text',
        'lang-title',
        'lang-value',
        'lang-alt'
    ],
    
    LocalizePage: function () {
        for (var i = 0; i < this.availableAttributes.length; i++) {
            var attr = this.availableAttributes[i];
            jq$('[' + attr + ']').each(function () {
                IzLocal.LocalizeElement(this, attr);
            });
        }
    },
    
    LocalizeElement: function (element, attribute) {
        if (jq$(element).attr(attribute) == undefined)
            return;
            
        var res = this.Res(jq$(element).attr(attribute));
        if (res) {
            var clearAttrName = attribute.toString().replace('lang-', '');
            if (clearAttrName == 'text')
                jq$(element).text(res);
            else
                jq$(element).attr(clearAttrName, res);
        }           
    },
    
    Res: function(key, defaultValue) {
        var resources = this.Resources[this.CurrentLanguage];
        if (resources == null)
            resources = this.Resources['en-US'];
        if (resources == null || resources[key] == null) {
            if (defaultValue != null)
                return defaultValue;
            else
                return key.replace('js_', '');
        }
            
        return resources[key];
    },
        
    Resources: {}
};
