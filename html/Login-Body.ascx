<%@ Control Language="C#" AutoEventWireup="true" %>

<div class="page">
    <form id="form1" runat="server">
        <asp:HiddenField ID="urlHashId" ClientIDMode="Static" Value="" runat="server" />
        <table style="width: 100%; height: 100%; text-align: center;">
            <tr>
                <td align="center">
                    <table style="text-align: center">
                        <tr>
                            <td>User name</td>
                            <td style="text-align: left;">
                                <asp:TextBox ID="userNameTextbox" runat="server" Width="100px"></asp:TextBox>
                            </td>
                        </tr>
                        <tr>
                            <td style="height: 26px">Password</td>
                            <td style="height: 26px; text-align: left;">
                                <input id="userPassword" runat="server" type="password" style="width: 100px" />
                            </td>
                        </tr>
                        <tr>
                            <td colspan="2">
                                <asp:Button ID="LoginButton1" runat="server" Text="Login" Width="110px" />
                            </td>
                        </tr>
                    </table>
                    <asp:CustomValidator ID="loginValidator" ClientIDMode="Static" runat="server"
                        ForeColor="Red" ErrorMessage="Login failed. Please check your user name and password and try again."></asp:CustomValidator>
                </td>
            </tr>
        </table>

        <script type="text/javascript">
            var hashInput = document.getElementById('<%=urlHashId.ClientID%>');
            hashInput.value = window.location.hash;
        </script>

        <script runat="server">
            bool AuthenticateUser(string userName, string password, out bool isAdmin)
            {
                isAdmin = false;
                if (userName.ToLower() == "admin" || userName.ToLower() == "administrator")
                    isAdmin = true;
                return true;
            }

            bool ProcessAuthenticationForm(string userName, string password)
            {
                bool isAdmin;
                if (AuthenticateUser(userName, password, out isAdmin))
                {
                    HttpContext.Current.Session["UserName"] = userName;
                    if (isAdmin)
                        HttpContext.Current.Session["Role"] = "Administrator";
                    else
                        HttpContext.Current.Session["Role"] = "RegularUser";

                    var hashId = HttpContext.Current.Request.Params[urlHashId.UniqueID] ?? "";
                    var returnUrl = HttpContext.Current.Request.Params["ReturnUrl"] ?? "";
                    returnUrl += hashId;
                    if (string.IsNullOrWhiteSpace(returnUrl))
                        returnUrl = FormsAuthentication.DefaultUrl;
                    FormsAuthentication.SetAuthCookie(userName, false);
                    HttpContext.Current.Response.Redirect(returnUrl, false);
                    HttpContext.Current.ApplicationInstance.CompleteRequest();
                    Page.Visible = false;
                    return true;
                }
                return false;
            }

            protected override void OnInit(EventArgs e)
            {
                loginValidator.IsValid = true;
                var userName = HttpContext.Current.Request.Form[userNameTextbox.UniqueID];
                var password = HttpContext.Current.Request.Form[userPassword.UniqueID];

                // run authentication for mvc pages:
                if (!string.IsNullOrEmpty(userName))
                    loginValidator.IsValid = ProcessAuthenticationForm(userName, password);
            }
        </script>

        <div style="text-align: center;">&nbsp;</div>
    </form>
</div>
