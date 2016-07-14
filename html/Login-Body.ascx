<%@ Control Language="C#" AutoEventWireup="true"%>

  <div class="page">
    <form id="form1" runat="server">
      <table style="width: 100%; height: 100%;">
        <tr>
          <td align="center">
            <table style="text-align: center">
              <tr>
                <td>User name</td>
                <td align="left">
                  <asp:TextBox ID="userNameTextbox" runat="server" Width="100px"></asp:TextBox>
                </td>
              </tr>
              <tr>
                <td style="height: 26px">Password</td>
                <td style="height: 26px" align="left">
                  <input id="userPassword" runat="server" type="password" style="width: 100px" />
                </td>
              </tr>
              <tr>
                <td colspan="2" align="center">
                  <asp:Button ID="Button1" runat="server" Text="Login" Width="110px" OnClick="Button1_Click" />
                </td>
              </tr>
            </table>
            <asp:CustomValidator ID="loginValidator" runat="server" ErrorMessage="Login failed. Please check your user name and password and try again.">            </asp:CustomValidator>
          </td>
        </tr>
      </table>

      <script runat="server">
        bool AuthenticateUser(string userName, string password, out bool isAdmin) {
          isAdmin = false;
          if (userName.ToLower() == "admin" || userName.ToLower() == "administrator")
            isAdmin = true;
          return true;
        }

        void Button1_Click(object sender, EventArgs args) {
          loginValidator.IsValid = true;
          bool isAdmin;
          if (AuthenticateUser(userNameTextbox.Text, userPassword.Value, out isAdmin)) {
            HttpContext.Current.Session["UserName"] = userNameTextbox.Text;
            if (isAdmin)
              HttpContext.Current.Session["Role"] = "Administrator";
            else
              HttpContext.Current.Session["Role"] = "RegularUser";
            FormsAuthentication.RedirectFromLoginPage(userNameTextbox.Text, false);
            return;
          }
          loginValidator.IsValid = false;
        }
      </script>

      <div style="text-align: center;">
        &nbsp;
      </div>
    </form>
  </div>

