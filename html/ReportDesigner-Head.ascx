<%@ Control Language="C#" AutoEventWireup="true" %>

<script type="text/javascript">
    $(document).ready(function () {
        var fieldWithRn = document.getElementById('reportNameFor2ver');
        if (fieldWithRn != undefined && fieldWithRn != null) {
            var frn = decodeURIComponent(fieldWithRn.value.replace(/\\'/g, "'"));
          while (frn.indexOf('+') >= 0) {
            frn = frn.replace('+', ' ');
          }
          while (frn.indexOf('\\\\') >= 0) {
            frn = frn.replace('\\\\', '\\');
          }
          var frNodes = frn.split('\\');
          var hdr = '<h1 style=\"margin-left:40px;\">' + frNodes[frNodes.length - 1].replace(/'/g, "&#39;") + (frNodes.length <= 1 ? '' : ' <i>(' + frNodes[frNodes.length - 2].replace(/'/g, "&#39;") + ')</i>') + '</h1>';
          var repHeader = document.getElementById('repHeader');
          repHeader.innerHTML = hdr;
      }
    });
</script>